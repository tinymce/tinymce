import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as InsertContent from 'tinymce/core/content/InsertContent';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.content.InsertContentForcedRootBlockFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    forced_root_block: false,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  const trimBrs = (string: string) => {
    return string.replace(/<br>/g, '');
  };

  it('insertAtCaret - selected image with bogus div', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<img src="about:blank" /><div data-mce-bogus="all">x</div>';
    editor.focus();
    // editor.selection.setCursorLocation(editor.getBody(), 0);
    editor.selection.select(editor.dom.select('img')[0]);
    InsertContent.insertAtCaret(editor, 'a');
    assert.equal(trimBrs(editor.getBody().innerHTML), 'a<div data-mce-bogus="all">x</div>');
  });

  it('insertAtCaret - selected text with bogus div', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'a<div data-mce-bogus="all">x</div>';
    editor.focus();
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 0);
    rng.setEnd(editor.getBody().firstChild, 1);
    editor.selection.setRng(rng);
    InsertContent.insertAtCaret(editor, 'b');
    assert.equal(trimBrs(editor.getBody().innerHTML), 'b<div data-mce-bogus="all">x</div>');
  });
});
