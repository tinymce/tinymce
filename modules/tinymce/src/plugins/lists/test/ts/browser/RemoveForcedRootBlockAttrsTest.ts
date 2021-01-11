import { before, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.lists.RemoveForcedRootBlockAttrsTest', () => {
  const hooks = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    valid_elements:
      'li[style|class|data-custom],ol[style|class|data-custom],' +
      'ul[style|class|data-custom],dl,dt,dd,em,strong,span,#p,div,br',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,' +
        'font-style,text-decoration,float,margin,margin-top,margin-right,' +
        'margin-bottom,margin-left,display,position,top,left,list-style-type'
    },
    base_url: '/project/tinymce/js/tinymce',
    forced_root_block_attrs: {
      'data-editor': '1'
    }
  });

  before(() => {
    Plugin();
    Theme();
  });

  it('TestCase-TBA: Lists: Remove UL with forced_root_block_attrs', () => {
    const editor = hooks.editor();
    editor.setContent(
      '<ul>' +
      '<li data-editor="1">a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, '<p data-editor="1">a</p>');
    assert.equal(editor.selection.getStart().nodeName, 'P');
  });
});
