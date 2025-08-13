import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import CodeSamplePlugin from 'tinymce/plugins/codesample/Plugin';

describe('browser.tinymce.plugins.codesample.ReadOnlyModeCodeSampleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    plugins: 'codesample',
    statusbar: false,
  }, [ CodeSamplePlugin ], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  const assertFakeSelection = (editor: Editor, expectedState: boolean) => {
    assert.equal(editor.selection.getNode().hasAttribute('data-mce-selected'), expectedState, 'Selected element should have expected state');
  };

  const preCodeSampleHtml = `<pre class="language-javascript"><code>console.log("test");</code></pre>`;

  it('TINY-10981: Allow selection of pre elements (codesample) in readonly mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(preCodeSampleHtml);
    TinySelections.select(editor, 'pre', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'pre', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'design');
    TinySelections.select(editor, 'pre', []);
    assertFakeSelection(editor, true);
  });

  it('TINY-10981: Deleting pre block should not be permitted', async () => {
    const editor = hook.editor();
    editor.setContent(preCodeSampleHtml);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'pre', []);
    assertFakeSelection(editor, true);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertContent(editor, preCodeSampleHtml);

    setMode(editor, 'design');
    TinySelections.select(editor, 'pre', []);
    assertFakeSelection(editor, true);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertContent(editor, '');
  });

  const assertRangeInCaretContainerBlock = (editor: Editor) =>
    assert.isTrue(CaretContainer.isRangeInCaretContainerBlock(editor.selection.getRng()));

  it('TINY-10981: Moving cursor around pre elements (codesample) block', () => {
    const editor = hook.editor();
    editor.setContent(`<p>test</p>${preCodeSampleHtml}`);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);

    TinyContentActions.keystroke(editor, Keys.right());
    assertRangeInCaretContainerBlock(editor);

    TinyContentActions.keystroke(editor, Keys.right());
    assertFakeSelection(editor, true);

    TinyContentActions.keystroke(editor, Keys.right());
    assertRangeInCaretContainerBlock(editor);
    setMode(editor, 'design');
  });
});
