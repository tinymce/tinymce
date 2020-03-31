import { Arr } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';

import { keyevent, MixedKeyModifiers } from '../keyboard/FakeKeys';
import { Chain } from './Chain';
import * as FocusTools from './FocusTools';
import { Step } from './Step';

/*
  doc - document scope
  value - which keycode
  modifiers - { shift: BOOL, alt: BOOL }
  dispatcher - dispatch event from some element
*/
const fakeKeys = (types: string[]) => (value: number, modifiers: MixedKeyModifiers, dispatcher: Element<any>) => {
  const doc = Traverse.owner(dispatcher);
  Arr.each(types, (type) => {
    keyevent(type, doc, value, modifiers, dispatcher);
  });
};

const cFakeKey = (types: string[], keyvalue: number, modifiers: MixedKeyModifiers) => Chain.op((dispatcher: Element<any>) => {
  fakeKeys(types)(keyvalue, modifiers, dispatcher);
});

const sFakeKey = (types: string[]) => <T>(doc: Element<any>, keyvalue: number, modifiers: MixedKeyModifiers): Step<T, T> => Chain.asStep<T, Element>(doc, [
  FocusTools.cGetFocused,
  cFakeKey(types, keyvalue, modifiers)
]);

const keydownTypes = [ 'keydown' ];
const keyupTypes = [ 'keyup' ];
const keypressTypes = [ 'keypress' ];
// Should throw an error
const keystrokeTypes = [ 'keydown', 'keyup' ];

const keydown = fakeKeys(keydownTypes);
const keyup = fakeKeys(keyupTypes);
const keypress = fakeKeys(keypressTypes);
const keystroke = fakeKeys(keystrokeTypes);

const sKeydown = sFakeKey(keydownTypes);
const sKeyup = sFakeKey(keyupTypes);
const sKeypress = sFakeKey(keypressTypes);
const sKeystroke = sFakeKey(keystrokeTypes);

export {
  keydown,
  keyup,
  keypress,
  keystroke,

  sKeydown,
  sKeyup,
  sKeypress,
  sKeystroke
};
