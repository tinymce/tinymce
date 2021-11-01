import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.InlineTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    inline: true,
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
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: Remove UL in inline body element contained in LI', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul>');
    editor.selection.setCursorLocation();
    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('TBA: Backspace in LI in UL in inline body element contained within LI', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul>');
    editor.focus();
    editor.selection.select(editor.getBody(), true);
    editor.selection.collapse(true);
    editor.plugins.lists.backspaceDelete();
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });
});
