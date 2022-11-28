import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.FilterContentTest', () => {
  context('wrapping the list child text nodes within list item elements', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'lists',
      indent: false,
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ]);

    it('TINY-4818: text node as a list first child', () => {
      const editor = hook.editor();
      editor.setContent('<ul>TEXT<li>a</li></ul>');
      TinyAssertions.assertContent(editor, '<ul><li>TEXT</li><li>a</li></ul>');
    });

    it('TINY-4818: text node between the list items', () => {
      const editor = hook.editor();
      editor.setContent('<ul><li>a</li>TEXT<li>b</li></ul>');
      TinyAssertions.assertContent(editor, '<ul><li>a</li><li>TEXT</li><li>b</li></ul>');
    });

    it('TINY-4818: text node as a list last child', () => {
      const editor = hook.editor();
      editor.setContent('<ul><li>a</li>TEXT</ul>');
      TinyAssertions.assertContent(editor, '<ul><li>a</li><li>TEXT</li></ul>');
    });

    it('TINY-4818: complex case for ordered list', () => {
      const editor = hook.editor();
      editor.setContent('<ol>Text1<li>a</li><li>b</li>Text2<li>c</li>Text3</ol>');
      TinyAssertions.assertContent(editor, '<ol><li>Text1</li><li>a</li><li>b</li><li>Text2</li><li>c</li><li>Text3</li></ol>');
    });
  });

});

