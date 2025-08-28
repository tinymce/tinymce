import { TinyAssertions, TinyContentActions, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { NormalizedEvent } from 'tinymce/core/events/EventUtils';
import * as InsertNewLine from 'tinymce/core/newline/InsertNewLine';

export const testBeforeInputEvent = (performEditAction: (editor: Editor) => void, eventType: string) =>
  (
    editor: Editor,
    setupHtml: string,
    setupPath: number[],
    setupOffset: number,
    expectedHtml: string,
    cancelBeforeInput: boolean
  ): void => {
    const inputEvents: string[] = [];
    const beforeInputEvents: string[] = [];
    const collect = (event: NormalizedEvent<InputEvent, any>) => {
      inputEvents.push(event.inputType);
    };
    const beforeInputCollect = (event: NormalizedEvent<InputEvent, any>) => {
      beforeInputEvents.push(event.inputType);

      if (cancelBeforeInput) {
        event.preventDefault();
      }
    };

    editor.on('input', collect);
    editor.on('beforeinput', beforeInputCollect);
    editor.setContent(setupHtml);
    TinySelections.setCursor(editor, setupPath, setupOffset);
    performEditAction(editor);
    editor.off('beforeinput', beforeInputCollect);
    editor.off('input', collect);

    TinyAssertions.assertContent(editor, expectedHtml);

    assert.deepEqual(inputEvents, cancelBeforeInput ? [] : [ eventType ]);
    assert.deepEqual(beforeInputEvents, [ eventType ]);
  };

export const pressKeyAction = (key: number) => (editor: Editor): void =>
  TinyContentActions.keydown(editor, key);

export const insertNewLineAction = (editor: Editor): void =>
  InsertNewLine.insert(editor, {} as EditorEvent<KeyboardEvent>);
