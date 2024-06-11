import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.RetainListItemStylesTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TINY-10837: Toggle list on/off on paragraphs should retain styles like color and alignment', () => {
    const editor = hook.editor();
    const initialContent = '<p style="color: red; text-align: center;">a</p><p style="color: green; text-align: right;">b</p>';

    editor.setContent(initialContent);
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);

    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertContent(editor, '<ul><li style="color: red; text-align: center;">a</li><li style="color: green; text-align: right;">b</li></ul>');

    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertContent(editor, initialContent);
  });
});

