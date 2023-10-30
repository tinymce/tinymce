import { Adt, Arr, Optional } from '@ephox/katamari';

import { KeyModifiers, MixedKeyModifiers, newModifiers } from '../keyboard/FakeKeys';
import * as SeleniumAction from '../server/SeleniumAction';
import { Step } from './Step';

export interface KeyPressAdt {
  fold: <T> (combo: (modifiers: Modifiers, letters: string) => T, text: (s: string) => T, backspace: () => T, deleteKey: () => T) => T;
  match: <T>(branches: {
    combo: (modifiers: Modifiers, letters: string) => T;
    text: (s: string) => T;
    backspace: () => T;
    deleteKey: () => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  combo: (modifiers: Modifiers, letter: string) => KeyPressAdt;
  text: (s: string) => KeyPressAdt;
  backspace: () => KeyPressAdt;
  deleteKey: () => KeyPressAdt;
} = Adt.generate([
  { combo: [ 'modifiers', 'letter' ] },
  { text: [ 's' ] },
  { backspace: [] },
  { deleteKey: [] },
]);

interface Modifiers {
  readonly ctrlKey: Optional<boolean>;
  readonly metaKey: Optional<boolean>;
  readonly shiftKey: Optional<boolean>;
  readonly altKey: Optional<boolean>;
}

const modifierList = (obj: KeyModifiers): Modifiers => ({
  ctrlKey: Optional.from(obj.ctrlKey),
  metaKey: Optional.from(obj.metaKey),
  shiftKey: Optional.from(obj.shiftKey),
  altKey: Optional.from(obj.altKey)
});

const toSimpleFormat = (keys: KeyPressAdt[]) =>
  Arr.map(keys, (key: KeyPressAdt) => key.fold<any>((modifiers: Modifiers, letter: string) => ({
    combo: {
      ctrlKey: modifiers.ctrlKey.getOr(false),
      shiftKey: modifiers.shiftKey.getOr(false),
      metaKey: modifiers.metaKey.getOr(false),
      altKey: modifiers.altKey.getOr(false),
      key: letter
    }
  }), (s: string) => ({ text: s }), () => ({ text: '\u0008' }), () => ({ text: '\u007F' })));

const sSendKeysOn = <T>(selector: string, keys: KeyPressAdt[]): Step<T, T> =>
  SeleniumAction.sPerform<T>('/keys', {
    selector,
    keys: toSimpleFormat(keys)
  });

const pSendKeysOn = (selector: string, keys: KeyPressAdt[]): Promise<{}> =>
  SeleniumAction.pPerform('/keys', {
    selector,
    keys: toSimpleFormat(keys)
  });

const combo = (modifiers: MixedKeyModifiers, letter: string): KeyPressAdt => {
  const mods = modifierList(newModifiers(modifiers));
  return adt.combo(mods, letter);
};

const backspace = adt.backspace;
const deleteKey = adt.deleteKey;

const text = adt.text;

export const RealKeys = {
  combo,
  backspace,
  deleteKey,
  text,
  sSendKeysOn,
  pSendKeysOn
  // TODO: sSendKeysTo (and sSendKeys) which tags the element so that it can pass through a selector
};
