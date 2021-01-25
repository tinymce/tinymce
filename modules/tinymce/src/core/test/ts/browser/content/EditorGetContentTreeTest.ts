import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.content.EditorGetContentTreeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    inline: true
  }, [ Theme ]);

  const toHtml = (node: AstNode): string => {
    const htmlSerializer = HtmlSerializer({});
    return htmlSerializer.serialize(node);
  };

  it('Get content as tree', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    const html = toHtml(editor.getContent({ format: 'tree' }));
    Assertions.assertHtml('Should be expected html', '<p>a</p>', html);
  });

  it('Get selection as tree', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab<em>c</em></p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 1, 0 ], 1);
    const html = toHtml(editor.selection.getContent({ format: 'tree' }));
    Assertions.assertHtml('Should be expected selection html', 'b<em>c</em>', html);
  });

  it('Get selection as tree with whitespace', () => {
    const editor = hook.editor();
    editor.setContent('<p>a b c</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 4);
    const html = toHtml(editor.selection.getContent({ format: 'tree' }));
    Assertions.assertHtml('Should be expected selection html', ' b ', html);
  });
});
