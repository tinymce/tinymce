import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/anchor/Plugin';

import { pAddAnchor, pAssertAnchorPresence } from '../module/Helpers';

describe('browser.tinymce.plugins.anchor.AnchorAllowHtmlTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'anchor',
    toolbar: 'anchor',
    allow_html_in_named_anchor: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const assertContentStructure = (editor: Editor, id: string, isContentEditable: boolean, innerContent: string) =>
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, arr) => s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('a', {
                html: str.is(innerContent),
                attrs: { contenteditable: isContentEditable ? str.none() : str.is('false'), id: str.is(id) },
                classes: [ arr.has('mce-item-anchor') ]
              }),
              s.theRest()
            ]
          })
        ]
      }))
    );

  it('TINY-2788: Add anchor without inner html, check contenteditable is false', () => {
    const editor = hook.editor();
    editor.setContent('<p><a id="abc"></a></p>');
    assertContentStructure(editor, 'abc', false, '');
  });

  // Note: The next step should pass because of the allow_html_in_named_anchor setting
  it('TINY-2788: Add anchor with inner html, check contenteditable is not present and inner html is present', () => {
    const editor = hook.editor();
    editor.setContent('<p><a id="abc">abc</a></p>');
    assertContentStructure(editor, 'abc', true, 'abc');
  });

  it('TINY-6236: Select text and insert anchor, check selected text is included within anchor', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await pAddAnchor(editor, 'abc');
    await pAssertAnchorPresence(editor, 1);
    assertContentStructure(editor, 'abc', true, 'abc');
  });

  it('TINY-6236: Check non-empty anchor can be inserted and updated', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await pAddAnchor(editor, 'abc');
    assertContentStructure(editor, 'abc', true, 'abc');
    // Latest html: <p><a id="abc">abc</a></p>
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    await pAddAnchor(editor, 'def');
    assertContentStructure(editor, 'def', true, 'abc');
  });

  it('TINY-6236: Check bare anchor can be converted to a named anchor', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a>abc</a></p>');
    editor.focus();
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    await pAddAnchor(editor, 'abc');
    await pAssertAnchorPresence(editor, 1);
    assertContentStructure(editor, 'abc', true, 'abc');
  });

  it('TINY-6236: Select over existing anchor and insert new anchor, check existing anchor is removed and new anchor is inserted', async () => {
    const editor = hook.editor();
    // Test for empty anchor
    editor.setContent('<p>ab<a id="abc"></a>cd</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 2 ], 2);
    await pAddAnchor(editor, 'def');
    await pAssertAnchorPresence(editor, 1);
    assertContentStructure(editor, 'def', true, 'abcd');
    // Test for non-empty anchor
    editor.setContent('<p>ab<a id="abc">cd</a>ef</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 2 ], 2);
    await pAddAnchor(editor, 'def');
    await pAssertAnchorPresence(editor, 1);
    assertContentStructure(editor, 'def', true, 'abcdef');
  });

  it('TINY-6236: Partially select non-empty anchor and insert new anchor, check existing anchor is truncated and new anchor is inserted', async () => {
    const editor = hook.editor();
    editor.setContent('<p>ab<a id="abc">cdef</a>gh</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 0 ], 2);
    await pAddAnchor(editor, 'def');
    await pAssertAnchorPresence(editor, 2);
    TinyAssertions.assertContent(editor, '<p><a id="def">abcd</a><a id="abc">ef</a>gh</p>');
  });
});
