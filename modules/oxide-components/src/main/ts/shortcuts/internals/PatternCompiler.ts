import { Arr, Fun } from '@ephox/katamari';

import * as KeyboardModifiers from './KeyboardModifiers';
import * as Utils from './Utils';

const PATTERN_DELIMITER = '+';
const SPACE = 'space';

type ShortcutPredicate = (event: KeyboardEvent) => boolean;

interface Shortcut {
  key: Array<string>;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
};

const compile = (pattern: string, isMac = false): ShortcutPredicate => {
  const parts = Arr.map(Utils.explode(pattern, PATTERN_DELIMITER), Utils.lowercase);
  const decodedShortcut = decodeShortcut(parts, isMac);

  if (decodedShortcut.key.length !== 1) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid shortcut pattern "${pattern}": valid pattern includes one key and zero or more modifiers`);
    return Fun.never;
  }
  const [ decodedShortcutKey ] = decodedShortcut.key;

  return (event: KeyboardEvent) => {
    if (event.ctrlKey !== decodedShortcut.ctrlKey) {
      return false;
    }
    if (event.altKey !== decodedShortcut.altKey) {
      return false;
    }
    if (event.shiftKey !== decodedShortcut.shiftKey) {
      return false;
    }
    if (event.metaKey !== decodedShortcut.metaKey) {
      return false;
    }

    if (Utils.lowercase(event.key) === decodedShortcutKey) {
      return true;
    }

    if (/^[a-z]$/.test(decodedShortcutKey)) {
      return event.code === `Key${decodedShortcutKey.toUpperCase()}`;
    }
    if (/^[0-9]$/.test(decodedShortcutKey)) {
      return event.code === `Digit${decodedShortcutKey}` || event.code === `Numpad${decodedShortcutKey}`;
    }

    return false;
  };
};

const decodeShortcut = (parts: string[], isMac: boolean): Shortcut => {
  const shortcut: Shortcut = {
    key: [],
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false
  };

  Arr.each(parts, (part) => {
    if (part === KeyboardModifiers.CONTROL) {
      shortcut.ctrlKey = true;
    } else if (part === KeyboardModifiers.ALT) {
      shortcut.altKey = true;
    } else if (part === KeyboardModifiers.SHIFT) {
      shortcut.shiftKey = true;
    } else if (part === KeyboardModifiers.META && isMac) {
      shortcut.metaKey = true;
    } else if (part === KeyboardModifiers.META && !isMac) {
      shortcut.ctrlKey = true;
    } else if (part === SPACE) {
      shortcut.key.push(' ');
    } else {
      shortcut.key.push(part);
    }
  });

  return shortcut;
};

export {
  compile
};
