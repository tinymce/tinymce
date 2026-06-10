import type { SugarElement } from '@ephox/sugar';

import * as Keycodes from './Keycodes';

export interface OldKeyModifiers {
  shift?: boolean;
  meta?: boolean;
  ctrl?: boolean;
  alt?: boolean;
}

export interface KeyModifiers {
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

export type MixedKeyModifiers = OldKeyModifiers | KeyModifiers;

const isNewKeyModifiers = (modifiers: MixedKeyModifiers): modifiers is KeyModifiers =>
  'shiftKey' in modifiers || 'metaKey' in modifiers || 'ctrlKey' in modifiers || 'altKey' in modifiers;

const newModifiers = (modifiers: MixedKeyModifiers): KeyModifiers => isNewKeyModifiers(modifiers) ? modifiers :
  { shiftKey: modifiers.shift, metaKey: modifiers.meta, ctrlKey: modifiers.ctrl, altKey: modifiers.alt };

const keyevent = (type: string, doc: SugarElement<Document>, value: number, modifiers: MixedKeyModifiers, focus?: SugarElement<Node>): void => {
  const view = doc.dom.defaultView;
  const mod = newModifiers(modifiers);
  const dispatcher = focus !== undefined ? focus : doc;

  const ctrlKey = mod.ctrlKey === true;
  const altKey = mod.altKey === true;
  const shiftKey = mod.shiftKey === true;
  const metaKey = mod.metaKey === true;
  const event = Keycodes.getKeyEventFromKeyCode(view, type, ctrlKey, altKey, shiftKey, metaKey, value).getOrDie('Could not find key event for code: ' + value);

  dispatcher.dom.dispatchEvent(event);
};

export {
  newModifiers,
  keyevent
};
