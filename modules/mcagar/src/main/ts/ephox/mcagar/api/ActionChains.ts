import { Chain, FocusTools, Keyboard, NamedChain } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';
import { Editor } from '../alien/EditorTypes';

export interface ActionChains {
  cContentKeypress: <T extends Editor> (code: number, modifiers?: Record<string, any>) => Chain<T, T>;
  cContentKeydown: <T extends Editor> (code: number, modifiers?: Record<string, any>) => Chain<T, T>;
  cContentKeystroke: <T extends Editor> (code: number, modifiers?: Record<string, any>) => Chain<T, T>;

  cUiKeydown: <T> (code: number, modifiers?: Record<string, any>) => Chain<T, T>;
}

const cIDoc = Chain.mapper(function (editor: Editor) {
  return Element.fromDom(editor.getDoc());
});

const cUiDoc = Chain.injectThunked(function () {
  return Element.fromDom(document);
});

const cTriggerKeyEvent = function <T>(cTarget: Chain<T, Element>, evtType: 'keydown' | 'keyup' | 'keypress' | 'keystroke', code: number, modifiers = {}) {
  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), cTarget, 'doc'),
    NamedChain.direct('doc', FocusTools.cGetFocused, 'activeElement'),
    NamedChain.direct('activeElement', Chain.op(function (dispatcher) {
      Keyboard[evtType](code, modifiers, dispatcher);
    }), '_'),
    NamedChain.output(NamedChain.inputName())
  ]);
};

export const ActionChains: ActionChains = {
  cContentKeypress: Fun.curry(cTriggerKeyEvent, cIDoc, 'keypress'),
  cContentKeydown: Fun.curry(cTriggerKeyEvent, cIDoc, 'keydown'),
  cContentKeystroke: Fun.curry(cTriggerKeyEvent, cIDoc, 'keystroke'),

  cUiKeydown: Fun.curry(cTriggerKeyEvent, cUiDoc, 'keydown')
};
