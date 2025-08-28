import { Keyboard, Step } from '@ephox/agar';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';

import { Editor } from '../../alien/EditorTypes';

export interface TinyActions {
  sContentKeydown: <T> (code: number, modifiers?: Record<string, any>) => Step<T, T>;
  sContentKeystroke: <T> (code: number, modifiers?: Record<string, any>) => Step<T, T>;
  sContentKeypress: <T> (code: number, modifiers?: Record<string, any>) => Step<T, T>;

  sUiKeydown: <T> (code: number, modifiers?: Record<string, any>) => Step<T, T>;
}

export const TinyActions = (editor: Editor): TinyActions => {
  const iDoc = SugarElement.fromDom(editor.getDoc());
  const uiDoc = SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getElement()));

  const sContentKeydown = <T>(code: number, modifiers = {}) => {
    return Keyboard.sKeydown<T>(iDoc, code, modifiers);
  };

  const sContentKeystroke = <T>(code: number, modifiers = {}) => {
    return Keyboard.sKeystroke<T>(iDoc, code, modifiers);
  };

  const sContentKeypress = <T>(code: number, modifiers = {}) => {
    return Keyboard.sKeypress<T>(iDoc, code, modifiers);
  };

  const sUiKeydown = <T>(code: number, modifiers = {}) => {
    return Keyboard.sKeydown<T>(uiDoc, code, modifiers);
  };

  return {
    sContentKeypress,
    sContentKeydown,
    sContentKeystroke,

    sUiKeydown
  };
};
