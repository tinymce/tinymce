import { after, before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.selection.SelectionBookmarkIframeEditorTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);
  const testDivId = 'testDiv1234';

  const removeTestDiv = () => {
    const input = document.querySelector('#' + testDivId);
    input.parentNode.removeChild(input);
  };

  const addTestDiv = () => {
    const div = document.createElement('div');
    div.innerHTML = 'xxx';
    div.contentEditable = 'true';
    div.id = testDivId;
    document.body.appendChild(div);
  };

  const focusDiv = () => {
    const input = document.querySelector<HTMLDivElement>('#' + testDivId);
    input.focus();
  };

  before(function () {
    // Only run on IE as other browsers support multiple selection
    if (!browser.isIE()) {
      this.skip();
    }
    addTestDiv();
  });

  after(() => {
    if (browser.isIE()) {
      removeTestDiv();
    }
  });

  it('assert selection after no nodechanged, should not restore', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');

    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false);
    focusDiv();

    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
  });

  it('assert selection after nodechanged, should restore', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');

    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 0);
    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
    focusDiv();

    TinyAssertions.assertSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
  });

  it('assert selection after keyup, should restore', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');

    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 0);
    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false);
    editor.fire('keyup', { } as KeyboardEvent);
    focusDiv();

    TinyAssertions.assertSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
  });

  it('assert selection after mouseup, should restore', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');

    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 0);
    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false);
    editor.fire('mouseup', { } as MouseEvent);
    focusDiv();

    TinyAssertions.assertSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
  });
});
