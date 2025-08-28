import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/anchor/Plugin';

import { pAddAnchor, pAssertAnchorPresence } from '../module/Helpers';

describe('browser.tinymce.plugins.anchor.AnchorSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: Add text and anchor, then check if that anchor is present in the editor', async () => {
    const editor = hook.editor();
    editor.setContent('abc');
    await pAddAnchor(editor, 'abc');
    await pAssertAnchorPresence(editor, 1);
    TinyAssertions.assertContent(editor, '<p><a id="abc"></a>abc</p>');
  });

  it('TINY-2788: Add anchor to empty editor, then check if that anchor is present in the editor', async () => {
    const editor = hook.editor();
    editor.setContent('');
    await pAddAnchor(editor, 'abc');
    await pAssertAnchorPresence(editor, 1);
    TinyAssertions.assertContent(editor, '<p><a id="abc"></a></p>');
  });

  it('TINY-2788: Add anchor to empty line, then check if that anchor is present in the editor', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p><p></p><p>def</p>');
    TinySelections.setCursor(editor, [ 1 ], 0);
    await pAddAnchor(editor, 'abc');
    await pAssertAnchorPresence(editor, 1);
    TinyAssertions.assertContent(editor, '<p>abc</p>\n<p><a id="abc"></a></p>\n<p>def</p>');
  });

  it('TINY-2788: Add two anchors side by side, then check if they are present in the editor', async () => {
    const editor = hook.editor();
    editor.setContent('');
    await pAddAnchor(editor, 'abc');
    await pAssertAnchorPresence(editor, 1);
    TinyAssertions.assertContent(editor, '<p><a id="abc"></a></p>');
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
    await pAddAnchor(editor, 'def');
    await pAssertAnchorPresence(editor, 2);
    TinyAssertions.assertContent(editor, '<p><a id="abc"></a><a id="def"></a></p>');
    TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
  });

  it('TINY-6236: Check bare anchor can be converted to a named anchor', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a>abc</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    await pAddAnchor(editor, 'abc');
    await pAssertAnchorPresence(editor, 1);
    // Text is shifted outside anchor since 'allow_html_in_named_anchor' setting is false by default
    TinyAssertions.assertContent(editor, '<p><a id="abc"></a>abc</p>');
  });
});
