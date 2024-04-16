import { Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.themes.silver.editor.contextmenu.ContextMenuOnSelectedContent', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true
  }, [ LinkPlugin ], true);

  it('TINY-10391: Opening context menu on selected content should not change selection', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one two three</p>');
    TinySelections.select(editor, 'p', []);
    Mouse.contextMenuOn(TinyDom.body(editor), 'p');
    TinyAssertions.assertSelection(editor, [ ], 0, [ ], 1);
  });

  it('TINY-10391: Opening context menu on a link within selected content should change to the selection to encompass the link', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one <a href="https://www.example.com">Example</a> two</p>');
    // Partially select the link
    TinySelections.setSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 6);
    Mouse.contextMenuOn(TinyDom.body(editor), 'a');
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);

    // Selection is extended to the surrounding of link. ie: select `e Example`
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 1 ], 1);
    Mouse.contextMenuOn(TinyDom.body(editor), 'a');
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
  });
});
