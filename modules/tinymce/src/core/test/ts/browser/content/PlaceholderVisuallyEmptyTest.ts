import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { isVisuallyEmpty } from 'tinymce/core/content/Placeholder';

describe('browser.tinymce.core.content.PlaceholderVisuallyEmptyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const assertEmpty = (label: string, editor: Editor, expected: boolean) => {
    const body = editor.getBody();
    assert.equal(isVisuallyEmpty(editor.dom, body, 'p'), expected, label);
  };

  const testEmpty = (editor: Editor, content: string) => {
    editor.setContent(content, { format: 'raw' });
    assertEmpty(`Check "${content}" is empty`, editor, true);
  };

  const testNotEmpty = (editor: Editor, content: string) => {
    editor.setContent(content, { format: 'raw' });
    assertEmpty(`Check "${content}" is not empty`, editor, false);
  };

  it('TINY-3917: Check content is visually empty', () => {
    const editor = hook.editor();
    testEmpty(editor, '<p></p>');
    testEmpty(editor, '<p><br /></p>');
    testEmpty(editor, '<p><br data-mce-bogus="1" /></p>');
    testEmpty(editor, '<p>' + Unicode.zeroWidth + '</p>');
    testEmpty(editor, '<p><span data-mce-bogus="1" data-mce-type="format-caret"><strong></strong></span><br data-mce-bogus="1" /></p>');
  });

  it('TINY-3917: Check content is NOT visually empty', () => {
    const editor = hook.editor();
    testNotEmpty(editor, '<p>Text</p>');
    testNotEmpty(editor, '<p>' + Unicode.nbsp + '</p>');
    testNotEmpty(editor, '<p><br data-mce-bogus="1" /><br /></p>');
    testNotEmpty(editor, '<ol><li></li></ol>');
    testNotEmpty(editor, '<hr />');
    testNotEmpty(editor, '<p style="padding-left: 40px"><br data-mce-bogus="1" /></p>');
    testNotEmpty(editor, '<p><a href="#id">Link</a></p>');
    testNotEmpty(editor, '<p><span data-mce-bogus="all"><a href="#id">Link</a></span></p>');
    testNotEmpty(editor, '<figure><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" /></figure>');
    testNotEmpty(editor, '<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" /></p>');
    testNotEmpty(editor, '<table><tbody><tr><td></td><td></td></tr></tbody></table>');
    testNotEmpty(editor, '<pre class="language-markup"><code>test</code></pre>');
    testNotEmpty(editor, '<blockquote><p>' + Unicode.nbsp + '</p></blockquote>');
  });
});
