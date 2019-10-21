import { Keyboard, Step } from '@ephox/agar';
import { Element } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';
import { Editor } from '../alien/EditorTypes';

export interface TinyActions {
  sContentKeydown: <T> (code: number, modifiers?: Record<string, any>) => Step<T, T>;
  sContentKeystroke: <T> (code: number, modifiers?: Record<string, any>) => Step<T, T>;
  sContentKeypress: <T> (code: number, modifiers?: Record<string, any>) => Step<T, T>;

  sUiKeydown: <T> (code: number, modifiers?: Record<string, any>) => Step<T, T>;
}

export const TinyActions = function (editor: Editor): TinyActions {
  const iDoc = Element.fromDom(editor.getDoc());
  const uiDoc = Element.fromDom(document);

  const sContentKeydown = function <T> (code: number, modifiers = {}) {
    return Keyboard.sKeydown<T>(iDoc, code, modifiers);
  };

  const sContentKeystroke = function <T> (code: number, modifiers = {}) {
    return Keyboard.sKeystroke<T>(iDoc, code, modifiers);
  };

  const sContentKeypress = function <T> (code: number, modifiers = {}) {
    return Keyboard.sKeypress<T>(iDoc, code, modifiers);
  };

  const sUiKeydown = function <T> (code: number, modifiers = {}) {
    return Keyboard.sKeydown<T>(uiDoc, code, modifiers);
  };

  return {
    sContentKeypress,
    sContentKeydown,
    sContentKeystroke,

    sUiKeydown
  };
};
