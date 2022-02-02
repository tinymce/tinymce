import { Keyboard, Mouse } from '@ephox/agar';

import { Editor } from '../../alien/EditorTypes';
import * as TypeText from '../../keyboard/TypeText';
import { TinyDom } from '../TinyDom';

const keydown = (editor: Editor, keyvalue: number, modifiers: Keyboard.KeyModifiers = {}): void =>
  Keyboard.activeKeydown(TinyDom.document(editor), keyvalue, modifiers);

const keyup = (editor: Editor, keyvalue: number, modifiers: Keyboard.KeyModifiers = {}): void =>
  Keyboard.activeKeyup(TinyDom.document(editor), keyvalue, modifiers);

const keypress = (editor: Editor, keyvalue: number, modifiers: Keyboard.KeyModifiers = {}): void =>
  Keyboard.activeKeypress(TinyDom.document(editor), keyvalue, modifiers);

const keystroke = (editor: Editor, keyvalue: number, modifiers: Keyboard.KeyModifiers = {}): void =>
  Keyboard.activeKeystroke(TinyDom.document(editor), keyvalue, modifiers);

const type = (editor: Editor, content: string): void =>
  TypeText.typeContentAtSelection(TinyDom.document(editor), content);

const trueClick = (editor: Editor): void =>
  Mouse.trueClick(TinyDom.body(editor));

const trueClickOn = (editor: Editor, selector: string): void =>
  Mouse.trueClickOn(TinyDom.body(editor), selector);

export {
  keydown,
  keypress,
  keystroke,
  keyup,
  type,
  trueClick,
  trueClickOn
};
