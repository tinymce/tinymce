import { Type } from '@ephox/katamari';
import { SugarElement, Value } from '@ephox/sugar';

import * as Waiter from '../api/Waiter';
import { getKeyEventFromData } from './Keycodes';

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

  const keydownEvent = getKeyEventFromData(view, 'keydown', chr).getOrDie(`Could not find keydown event for char: ${chr}`);
  if (!rawInput.dispatchEvent(keydownEvent)) {
    return;
  }

  const keypressEvent = getKeyEventFromData(view, 'keypress', chr).getOrDie(`Could not find keypress event for char: ${chr}`);
  if (!rawInput.dispatchEvent(keypressEvent)) {
    return;
  }

  if (!rawInput.dispatchEvent(new view.InputEvent('beforeinput', { inputType: 'insertText', data: chr, cancelable: true, bubbles: true }))) {
    return;
  }

  Value.set(input, before + chr + after);
  rawInput.selectionStart = selectionStart + 1;
  rawInput.selectionEnd = selectionStart + 1;

  rawInput.dispatchEvent(new view.InputEvent('input', { inputType: 'insertText', data: chr, cancelable: false, bubbles: true }));

  const keyupEvent = getKeyEventFromData(view, 'keyup', chr).getOrDie(`Could not find keyup event for char: ${chr}`);
  rawInput.dispatchEvent(keyupEvent);
};

export const pTypeTextInInput = async (input: SugarElement<HTMLInputElement | HTMLTextAreaElement>, text: string, speed: number = 0): Promise<void> => {
  for (let i = 0; i < text.length; i++) {
    typeCharInInput(input, text[i]);
    await (speed === 0 ? Promise.resolve() : Waiter.pWait(speed));
  }
};

