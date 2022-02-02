import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.lists.RemoveForcedRootBlockFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
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
    forced_root_block: false
  }, [ Plugin, Theme ]);

  it('TBA: Remove UL with single LI in BR mode', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, 'a');
    assert.equal(editor.selection.getStart().nodeName, 'BODY');
  });

  it('TBA: Remove UL with multiple LI in BR mode', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:first', 1, 'li:last', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      'a<br />' +
      'b'
    );
    assert.equal(editor.selection.getStart().nodeName, 'BODY');
  });

  it('TBA: Remove empty UL between two textblocks in BR mode', () => {
    const editor = hook.editor();
    editor.setContent(
      '<div>a</div>' +
      '<ul>' +
      '<li></li>' +
      '</ul>' +
      '<div>b</div>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:first', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<div>a</div>' +
      '<br />' +
      '<div>b</div>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'BR');
  });
});
