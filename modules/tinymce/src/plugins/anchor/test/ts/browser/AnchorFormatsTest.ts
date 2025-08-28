import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/anchor/Plugin';

describe('browser.tinymce.plugins.anchor.AnchorFormatsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'anchor',
    toolbar: 'anchor',
    allow_html_in_named_anchor: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const testMatchFormat = (editor: Editor, expected: boolean) => {
    const match = editor.formatter.match('namedAnchor');
    assert.equal(match, expected, `Expected format match to be ${expected}`);
  };

  it('TINY-6236: Check that namedAnchor format matches on empty named anchor', () => {
    const editor = hook.editor();
    editor.setContent('<p><a id="abc"></a></p>');
    TinySelections.select(editor, 'a', []);
    testMatchFormat(editor, true);
  });

  it('TINY-6236: Check that namedAnchor format matches on non-empty named anchor', () => {
    const editor = hook.editor();
    editor.setContent('<p><a id="abc">abc</a></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    testMatchFormat(editor, true);
  });

  it('TINY-6236: Check that namedAnchor format does not match on normal text', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    testMatchFormat(editor, false);
  });

  it('TINY-6236: Check that namedAnchor format does not match on bare anchor', () => {
    const editor = hook.editor();
    editor.setContent('<p><a>abc</a></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    testMatchFormat(editor, false);
  });

  it('TINY-6236: Check that namedAnchor format does not match on normal link', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://www.test.com">http://www.test.com</a></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    testMatchFormat(editor, false);
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 3);
    testMatchFormat(editor, false);
  });
});
