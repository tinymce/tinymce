import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import MediaPlugin from 'tinymce/plugins/media/Plugin';

describe('browser.tinymce.plugins.media.core.ReadOnlyModeMediaTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    plugins: 'media',
    statusbar: false,
  }, [ MediaPlugin ], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  const assertFakeSelection = (editor: Editor, expectedState: boolean) => {
    assert.equal(editor.selection.getNode().hasAttribute('data-mce-selected'), expectedState, 'Selected element should have expected state');
  };

  const mediaElementHtml = `<span class="mce-preview-object mce-object-iframe" contenteditable="false" data-mce-object="iframe" data-mce-p-allowfullscreen="allowfullscreen" data-mce-p-src="https://www.youtube.com/embed/8aGhZQkoFbQ">`
    + `<iframe src="https://www.youtube.com/embed/8aGhZQkoFbQ" width="560" height="314" frameborder="0" allowfullscreen="allowfullscreen" data-mce-src="https://www.youtube.com/embed/8aGhZQkoFbQ"></iframe><span class="mce-shim"></span></span>`;
  const iframeMediaEmbedHtml = `<div style="left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 56.25%; max-width: 650px;" contenteditable="false" data-ephox-embed-iri="https://www.youtube.com/watch?v=8aGhZQkoFbQ">` +
    `<iframe style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" src="https://www.youtube.com/embed/8aGhZQkoFbQ?rel=0" scrolling="no" allowfullscreen="allowfullscreen"></iframe>` +
    `</div>`;

  it('TINY-10981: Allow selection of media element in readonly mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(mediaElementHtml);
    TinySelections.select(editor, 'span.mce-preview-object', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'span.mce-preview-object', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'design');
    TinySelections.select(editor, 'span.mce-preview-object', []);
    assertFakeSelection(editor, true);
  });

  it('TINY-10981: Allow selection of mediaembed element in readonly mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(iframeMediaEmbedHtml);
    TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'design');
    TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
    assertFakeSelection(editor, true);
  });

  it('TINY-10981: Deleting media element should not be permitted', async () => {
    const editor = hook.editor();
    editor.setContent(mediaElementHtml);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'span.mce-preview-object', []);
    assertFakeSelection(editor, true);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<p><iframe src="https://www.youtube.com/embed/8aGhZQkoFbQ" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>');

    setMode(editor, 'design');
    TinySelections.select(editor, 'span.mce-preview-object', []);
    assertFakeSelection(editor, true);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-10981: Deleting mediaembed element should not be permitted', async () => {
    const editor = hook.editor();
    editor.setContent(iframeMediaEmbedHtml);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
    assertFakeSelection(editor, true);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, iframeMediaEmbedHtml);

    setMode(editor, 'design');
    TinySelections.select(editor, 'div[data-ephox-embed-iri]', []);
    assertFakeSelection(editor, true);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-10981: Moving cursor around media element block', () => {
    const editor = hook.editor();
    editor.setContent(`<p>test</p>${mediaElementHtml}`);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);

    TinyContentActions.keystroke(editor, Keys.right());
    assertFakeSelection(editor, true);

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 1, 1 ], 1);
    setMode(editor, 'design');
  });
});
