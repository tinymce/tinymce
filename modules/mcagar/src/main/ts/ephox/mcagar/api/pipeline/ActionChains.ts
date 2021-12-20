import { Chain, FocusTools, Keyboard, NamedChain } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { Editor } from '../../alien/EditorTypes';

export interface ActionChains {
  cContentKeypress: <T extends Editor> (code: number, modifiers?: Record<string, any>) => Chain<T, T>;
  cContentKeydown: <T extends Editor> (code: number, modifiers?: Record<string, any>) => Chain<T, T>;
  cContentKeystroke: <T extends Editor> (code: number, modifiers?: Record<string, any>) => Chain<T, T>;

  cUiKeydown: <T> (code: number, modifiers?: Record<string, any>) => Chain<T, T>;
}

const cIDoc = Chain.mapper((editor: Editor) => {
  return SugarElement.fromDom(editor.getDoc());
});

const cUiDoc = Chain.injectThunked(() => {
  return SugarElement.fromDom(document);
});

const cTriggerKeyEvent = <T>(cTarget: Chain<T, SugarElement<Document>>, evtType: 'keydown' | 'keyup' | 'keypress' | 'keystroke', code: number, modifiers = {}) => {
  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), cTarget, 'doc'),
    NamedChain.direct('doc', FocusTools.cGetFocused, 'activeElement'),
    NamedChain.direct('activeElement', Chain.op((dispatcher) => {
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
