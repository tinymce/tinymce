import { Chain } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { FocusTools } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';

var cIDoc = Chain.mapper(function (editor: any) {
  return Element.fromDom(editor.getDoc());
});

var cUiDoc = Chain.mapper(function (editor: any) {
  return Element.fromDom(document);
});

var cTriggerKeyEvent = function (cTarget, evtType: string, code: number, modifiers = {}) {
  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), cTarget, 'doc'),
    NamedChain.direct('doc', FocusTools.cGetFocused, 'activeElement'),
    NamedChain.direct('activeElement', Chain.op(function (dispatcher) {
      Keyboard[evtType](code, modifiers, dispatcher);
    }), '_'),
    NamedChain.output(NamedChain.inputName())
  ]);
};

export default {
  cContentKeypress: Fun.curry(cTriggerKeyEvent, cIDoc, 'keypress'),
  cContentKeydown: Fun.curry(cTriggerKeyEvent, cIDoc, 'keydown'),
  cContentKeystroke: Fun.curry(cTriggerKeyEvent, cIDoc, 'keystroke'),

  cUiKeydown: Fun.curry(cTriggerKeyEvent, cUiDoc, 'keydown')
};