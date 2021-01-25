import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.FormatterRemoveForcedRootBlockFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    extended_valid_elements: 'b,i,span[style|contenteditable|class]',
    entities: 'raw',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
        'margin,margin-top,margin-right,margin-bottom,margin-left,display,text-align'
    },
    base_url: '/project/tinymce/js/tinymce',
    forced_root_block: false
  }, [ Theme ]);

  const getContent = (editor: Editor) => editor.getContent().toLowerCase().replace(/[\r]+/g, '');

  it('Remove block format from first block with forced_root_block: false', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { block: 'h1' });
    editor.getBody().innerHTML = '<h1>a</h1>b';
    LegacyUnit.setSelection(editor, 'h1', 0, 'h1', 1);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), 'a<br />b', 'Lines should be separated with br');
  });
});
