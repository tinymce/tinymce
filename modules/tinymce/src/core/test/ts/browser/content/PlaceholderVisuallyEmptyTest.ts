import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { isVisuallyEmpty } from 'tinymce/core/content/Placeholder';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.content.PlaceholderVisuallyEmptyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    forced_root_block: false
  }, [ Theme ]);

  const assertEmpty = (label: string, editor: Editor, expected: boolean, forcedRootBlockFalse: boolean) => {
    const body = editor.getBody();
    assert.equal(isVisuallyEmpty(editor.dom, body, forcedRootBlockFalse ? '' : 'p'), expected, label);
  };

  const testEmpty = (editor: Editor, content: string, forcedRootBlockFalse: boolean = false) => {
    editor.setContent(content, { format: 'raw' });
    assertEmpty(`Check "${content}" is empty`, editor, true, forcedRootBlockFalse);
  };

  const testNotEmpty = (editor: Editor, content: string, forcedRootBlockFalse: boolean = false) => {
    editor.setContent(content, { format: 'raw' });
    assertEmpty(`Check "${content}" is not empty`, editor, false, forcedRootBlockFalse);
  };

  it('TINY-3917: Check initial content is empty', () => {
    const editor = hook.editor();
    assertEmpty('Check base empty content', editor, true, true);
  });

  it('TINY-3917: Check content is visually empty - forced_root_block: "p"', () => {
    const editor = hook.editor();
    testEmpty(editor, '<p></p>');
    testEmpty(editor, '<p><br /></p>');
    testEmpty(editor, '<p><br data-mce-bogus="1" /></p>');
    testEmpty(editor, '<p>' + Unicode.zeroWidth + '</p>');
    testEmpty(editor, '<p><span data-mce-bogus="1" data-mce-type="format-caret"><strong></strong></span><br data-mce-bogus="1" /></p>');
  });

  it('TINY-3917: Check content is visually empty - forced_root_block: false', () => {
    const editor = hook.editor();
    testEmpty(editor, '', true);
    testEmpty(editor, '<br />', true);
    testEmpty(editor, '<br data-mce-bogus="1" />', true);
    testEmpty(editor, Unicode.zeroWidth);
    testEmpty(editor, '<span data-mce-bogus="1" data-mce-type="format-caret"><strong></strong></span><br data-mce-bogus="1" />', true);
  });

  it('TINY-3917: Check content is NOT visually empty - forced_root_block: "p"', () => {
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

  it('TINY-3917: Check content is NOT visually empty - forced_root_block: false', () => {
    const editor = hook.editor();
    testNotEmpty(editor, 'Text', true);
    testNotEmpty(editor, Unicode.nbsp, true);
    testNotEmpty(editor, '<br data-mce-bogus="1" /><br />');
    testNotEmpty(editor, '<ol><li></li></ol>', true);
    testNotEmpty(editor, '<hr />', true);
    testNotEmpty(editor, '<div style="padding-left: 40px"><br data-mce-bogus="1" /></div>', true);
    testNotEmpty(editor, '<a href="#id">Link</a>', true);
    testNotEmpty(editor, '<span data-mce-bogus="all"><a href="#id">Link</a></span>', true);
    testNotEmpty(editor, '<figure><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" /></figure>', true);
    testNotEmpty(editor, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" />', true);
    testNotEmpty(editor, '<table><tbody><tr><td></td><td></td></tr></tbody></table>', true);
    testNotEmpty(editor, '<pre class="language-markup"><code>test</code></pre>', true);
    testNotEmpty(editor, '<blockquote><p>' + Unicode.nbsp + '</p></blockquote>', true);
  });
});
