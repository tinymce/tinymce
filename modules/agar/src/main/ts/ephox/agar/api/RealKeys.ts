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
  {combo: ['modifiers', 'letter']},
  {text: ['s']},
  {backspace: []}
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

const toSimpleFormat = (keys: KeyPressAdt[]) =>
  Arr.map(keys, (key: KeyPressAdt) => key.fold<any>((modifiers: Modifiers, letter: string) => ({
    combo: {
      ctrlKey: modifiers.ctrlKey().getOr(false),
      shiftKey: modifiers.shiftKey().getOr(false),
      metaKey: modifiers.metaKey().getOr(false),
      altKey: modifiers.altKey().getOr(false),
      key: letter
    }
  }), (s: string) => ({text: s}), () => ({text: '\u0008'})));

const sSendKeysOn = <T>(selector: string, keys: KeyPressAdt[]): Step<T, T> =>
  SeleniumAction.sPerform<T>('/keys', {
    selector,
    keys: toSimpleFormat(keys)
  });

const combo = (modifiers: MixedKeyModifiers, letter: string) => {
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
