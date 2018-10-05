import { Keyboard } from '@ephox/agar';
import { Element } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';

export default function (editor) {
  var iDoc = Element.fromDom(editor.getDoc());
  var uiDoc = Element.fromDom(document);

  var sContentKeydown = function (code: number, modifiers = {}) {
    return Keyboard.sKeydown(iDoc, code, modifiers);
  };

  var sContentKeystroke = function (code: number, modifiers = {}) {
    return Keyboard.sKeystroke(iDoc, code, modifiers);
  };

  var sContentKeypress = function (code: number, modifiers = {}) {
    return Keyboard.sKeypress(iDoc, code, modifiers);
  };

  var sUiKeydown = function (code: number, modifiers = {}) {
    return Keyboard.sKeydown(uiDoc, code, modifiers);
  };

  return {
    sContentKeypress: sContentKeypress,
    sContentKeydown: sContentKeydown,
    sContentKeystroke: sContentKeystroke,

    sUiKeydown: sUiKeydown
  };
};