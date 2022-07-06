import Editor from '../api/Editor';
import * as Rtc from '../Rtc';

export const addVisual = (editor: Editor, elm?: HTMLElement): void =>
  Rtc.addVisual(editor, elm);
