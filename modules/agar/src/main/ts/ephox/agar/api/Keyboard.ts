import { Arr } from '@ephox/katamari';
import { Focus, SugarElement, Traverse } from '@ephox/sugar';

import { keyevent, MixedKeyModifiers } from '../keyboard/FakeKeys';
import { Step } from './Step';

export type KeyModifiers = MixedKeyModifiers;

/*
  doc - document scope
  value - which keycode
  modifiers - { shift: BOOL, alt: BOOL }
  dispatcher - dispatch event from some element
*/
const fakeKeys = (types: string[]) => (value: number, modifiers: KeyModifiers = {}, dispatcher: SugarElement<Node>) => {
  const doc = Traverse.owner(dispatcher);
  Arr.each(types, (type) => {
    keyevent(type, doc, value, modifiers, dispatcher);
  });
};

const activeFakeKeys = (types: string[]) => (doc: SugarElement<Document | ShadowRoot>, value: number, modifiers: KeyModifiers = {}) => {
  const focused = Focus.active(doc).getOrDie('Could not find active element');
  fakeKeys(types)(value, modifiers, focused);
};

const sFakeKey = (types: string[]) => <T>(doc: SugarElement<Document | ShadowRoot>, keyvalue: number, modifiers: KeyModifiers = {}): Step<T, T> => Step.sync(() => {
  activeFakeKeys(types)(doc, keyvalue, modifiers);
});

const keydownTypes = [ 'keydown' ];
const keyupTypes = [ 'keyup' ];
const keypressTypes = [ 'keypress' ];
// Should throw an error
const keystrokeTypes = [ 'keydown', 'keyup' ];

const keydown = fakeKeys(keydownTypes);
const keyup = fakeKeys(keyupTypes);
const keypress = fakeKeys(keypressTypes);
const keystroke = fakeKeys(keystrokeTypes);

const activeKeydown = activeFakeKeys(keydownTypes);
const activeKeyup = activeFakeKeys(keyupTypes);
const activeKeypress = activeFakeKeys(keypressTypes);
const activeKeystroke = activeFakeKeys(keystrokeTypes);

const sKeydown = sFakeKey(keydownTypes);
const sKeyup = sFakeKey(keyupTypes);
const sKeypress = sFakeKey(keypressTypes);
const sKeystroke = sFakeKey(keystrokeTypes);

export {
  keydown,
  keyup,
  keypress,
  keystroke,

  activeKeydown,
  activeKeyup,
  activeKeypress,
  activeKeystroke,

  sKeydown,
  sKeyup,
  sKeypress,
  sKeystroke
};
