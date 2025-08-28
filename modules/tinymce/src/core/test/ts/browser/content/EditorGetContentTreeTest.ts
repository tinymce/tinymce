import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyApis, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';

describe('browser.tinymce.core.content.EditorGetContentTreeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    inline: true
  }, []);

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

  it('TINY-10305: getContent tree should strip all ZWNBSP characters', () => {
    const editor = hook.editor();
    TinyApis(editor).setRawContent('<p>te\uFEFFst</p>');
    const html = toHtml(editor.getContent({ format: 'tree' }));
    Assertions.assertHtml('Should be expected html', '<p>test</p>', html);
  });
});
