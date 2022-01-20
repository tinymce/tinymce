import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.delete.BeforeInputTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const testBackspace = (
    setupHtml: string,
    setupPath: number[],
    setupOffset: number,
    expectedHtml: string,
    cancelBeforeInput: boolean
  ) => {
    const editor = hook.editor();
    const inputEvents: string[] = [];
    const collect = (event: InputEvent) => {
      inputEvents.push(event.inputType);
    };
    const beforeInputCollect = (event: InputEvent) => {
      collect(event);

      if (cancelBeforeInput) {
        event.preventDefault();
      }
    };

    editor.on('input', collect);
    editor.on('beforeinput', beforeInputCollect);
    editor.setContent(setupHtml);
    TinySelections.setCursor(editor, setupPath, setupOffset);
    editor.nodeChanged();
    TinyContentActions.keydown(editor, Keys.backspace());
    editor.off('beforeinput', beforeInputCollect);
    editor.off('input', collect);

    TinyAssertions.assertContent(editor, expectedHtml);

    assert.deepEqual(inputEvents, cancelBeforeInput ? [ 'deleteContentBackward' ] : [ 'deleteContentBackward', 'deleteContentBackward' ]);
  };

  it('Gets beforeInput', () => {
    testBackspace('<p>a<a href="#">bc</a>d</p>', [ 0, 1, 0 ], 1, '<p>a<a href="#">c</a>d</p>', false);
  });

  it('Can prevert beforeInput', () => {
    testBackspace('<p>a<a href="#">bc</a>d</p>', [ 0, 1, 0 ], 1, '<p>a<a href="#">bc</a>d</p>', true);
  });
});
