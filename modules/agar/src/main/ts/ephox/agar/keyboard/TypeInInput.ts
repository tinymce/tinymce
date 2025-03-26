import { Type } from '@ephox/katamari';
import { SugarElement, Value } from '@ephox/sugar';

import * as Waiter from '../api/Waiter';

const typeCharInInput = (input: SugarElement<HTMLInputElement | HTMLTextAreaElement>, chr: string) => {
  const rawInput = input.dom;
  const { selectionStart, selectionEnd } = rawInput;

  if (Type.isNullable(selectionStart) || Type.isNullable(selectionEnd)) {
    throw new Error('Element does not have text selection properties');
  }

  const value = Value.get(input);
  const before = value.substring(0, selectionStart);
  const after = value.substring(selectionEnd);
  const view = rawInput.ownerDocument.defaultView;
  const charCode = chr.charCodeAt(0);

  if (!rawInput.dispatchEvent(new view.KeyboardEvent('keydown', { charCode, cancelable: true, bubbles: true }))) {
    return;
  }

  if (!rawInput.dispatchEvent(new view.InputEvent('beforeinput', { inputType: 'insertText', data: chr, cancelable: true, bubbles: true }))) {
    return;
  }

  Value.set(input, before + chr + after);
  rawInput.selectionStart = selectionStart + 1;

  rawInput.dispatchEvent(new view.InputEvent('input', { inputType: 'insertText', data: chr, cancelable: true, bubbles: true }));
  rawInput.dispatchEvent(new view.KeyboardEvent('keyup', { charCode, cancelable: true, bubbles: true }));
};

export const pTypeTextInInput = async (input: SugarElement<HTMLInputElement | HTMLTextAreaElement>, text: string, speed: number = 0): Promise<void> => {
  for (let i = 0; i < text.length; i++) {
    typeCharInInput(input, text[i]);
    await (speed === 0 ? Promise.resolve() : Waiter.pWait(speed));
  }
};

