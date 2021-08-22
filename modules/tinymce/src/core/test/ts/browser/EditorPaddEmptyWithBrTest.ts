import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.EditorPaddEmptyWithBrTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    custom_elements: 'custom1,~custom2',
    extended_valid_elements: 'custom1,custom2,script[*]',
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    padd_empty_with_br: true
  }, [ Theme ]);

  it('Padd empty elements with br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p></p>');
    assert.equal(editor.getContent(), '<p>a</p><p><br /></p>');
  });

  it('Padd empty elements with br on insert at caret', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.insertContent('<p>b</p><p></p>');
    assert.equal(editor.getContent(), '<p>a</p><p>b</p><p><br /></p>');
  });
});
