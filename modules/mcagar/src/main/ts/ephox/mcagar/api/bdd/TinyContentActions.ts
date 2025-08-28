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

const pWaitForEventToStopFiring = (editor: Editor, eventName: string, timing: { delay: number; timeout: number }): Promise<void> =>
  new Promise((resolve, reject) => {
    const startTime = Date.now();
    let timer: number | undefined;
    const onEditorEvent = () => {
      const currentTime = Date.now();
      if (currentTime - startTime > timing.timeout) {
        editor.off(eventName, onEditorEvent);
        reject(
          `It took too long (${currentTime - startTime} ms) to stop receiving ${eventName} events. Max timeout was: ${timing.timeout} ms.`
        );
      } else {
        if (timer !== undefined) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          editor.off(eventName, onEditorEvent);
          resolve();
        }, timing.delay);
      }
    };

    editor.on(eventName, onEditorEvent);
    onEditorEvent();
  });

export {
  keydown,
  keypress,
  keystroke,
  keyup,
  type,
  trueClick,
  trueClickOn,
  pWaitForEventToStopFiring
};
