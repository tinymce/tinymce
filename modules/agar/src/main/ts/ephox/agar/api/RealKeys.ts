import { Adt, Arr, Option, Struct } from '@ephox/katamari';

import { MixedKeyModifiers, newModifiers } from '../keyboard/FakeKeys';
import * as SeleniumAction from '../server/SeleniumAction';
import { Step } from './Step';

interface KeyPressAdt {
  fold: <T> (combo: (modifiers: Modifiers, letters: string) => T, text: (s: string) => T, backspace: () => T) => T;
  match: <T>(branches: {
    combo: (modifiers: Modifiers, letters: string) => T;
    text: (s: string) => T;
    backspace: () => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  combo: (modifiers: Modifiers, letter: string) => KeyPressAdt;
  text: (s: string) => KeyPressAdt;
  backspace: () => KeyPressAdt;
} = Adt.generate([
  { combo: ['modifiers', 'letter'] },
  { text: ['s'] },
  { backspace: [] }
]);

interface Modifiers {
  ctrlKey: () => Option<boolean>;
  metaKey: () => Option<boolean>;
  shiftKey: () => Option<boolean>;
  altKey: () => Option<boolean>;
}

const modifierList = Struct.immutableBag<Modifiers>([], [
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'altKey'
]);

const toSimpleFormat = function (keys: KeyPressAdt[]) {
  return Arr.map(keys, function (key: KeyPressAdt) {
    return key.fold<any>(function (modifiers: Modifiers, letter: string) {
      return {
        combo: {
          ctrlKey: modifiers.ctrlKey().getOr(false),
          shiftKey: modifiers.shiftKey().getOr(false),
          metaKey: modifiers.metaKey().getOr(false),
          altKey: modifiers.altKey().getOr(false),
          key: letter
        }
      };
    }, function (s: string) {
      return { text: s };
    }, function () {
      return { text: '\u0008' };
    });
  });
};

const sSendKeysOn = function <T>(selector: string, keys: KeyPressAdt[]): Step<T, T> {
  return SeleniumAction.sPerform<T>('/keys', {
    selector,
    keys: toSimpleFormat(keys)
  });
};

const combo = function (modifiers: MixedKeyModifiers, letter: string) {
  const mods = modifierList(newModifiers(modifiers));
  return adt.combo(mods, letter);
};

const backspace = adt.backspace;

const text = adt.text;

export const RealKeys = {
  combo,
  backspace,
  text,
  sSendKeysOn
  // TODO: sSendKeysTo (and sSendKeys) which tags the element so that it can pass through a selector
};
