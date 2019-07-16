import { Keyboard } from '@ephox/agar';
import { Element } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';

export default function (editor) {
  const iDoc = Element.fromDom(editor.getDoc());
  const uiDoc = Element.fromDom(document);

  const sContentKeydown = function (code: number, modifiers = {}) {
    return Keyboard.sKeydown(iDoc, code, modifiers);
  };

  const sContentKeystroke = function (code: number, modifiers = {}) {
    return Keyboard.sKeystroke(iDoc, code, modifiers);
  };

  const sContentKeypress = function (code: number, modifiers = {}) {
    return Keyboard.sKeypress(iDoc, code, modifiers);
  };

  const sUiKeydown = function (code: number, modifiers = {}) {
    return Keyboard.sKeydown(uiDoc, code, modifiers);
  };

  return {
    sContentKeypress,
    sContentKeydown,
    sContentKeystroke,

    sUiKeydown
  };
}
