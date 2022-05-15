import { before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as SmartPaste from 'tinymce/core/paste/SmartPaste';

// Test cases for TINY-4523 - image url/anchor link paste smartpaste/pasteAsText interactions
// Pasting an image anchor link (<a href=”….jpg”>):
// |                          | smart_paste: true               | smart_paste: false              |
// |Paste as text turned off  | paste image link -> anchor link | paste image link -> anchor link |
// |Paste as text turned on   | paste image link -> text        | paste image link -> text        |
//
// Pasting an image URL (“https…….jpg”):
// |                          | smart_paste: true        | smart_paste: false      |
// |Paste as text turned off  | paste image URL -> image | paste image URL -> text |
// |Paste as text turned on   | paste image URL -> text  | paste image URL -> text |

describe('browser.tinymce.core.paste.SmartPasteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  beforeEach(() => {
    const editor = hook.editor();
    editor.focus();
  });

  it('TBA: isAbsoluteUrl', () => {
    assert.isTrue(SmartPaste.isAbsoluteUrl('http://www.site.com'));
    assert.isTrue(SmartPaste.isAbsoluteUrl('https://www.site.com'));
    assert.isTrue(SmartPaste.isAbsoluteUrl('http://www.site.com/dir-name/file.gif?query=%42'));
    assert.isTrue(SmartPaste.isAbsoluteUrl('https://www.site.com/dir-name/file.gif?query=%42'));
    assert.isTrue(SmartPaste.isAbsoluteUrl('https://www.site.com/dir-name/file.gif?query=%42#a'));
    assert.isTrue(SmartPaste.isAbsoluteUrl('https://www.site.com/~abc'));
    assert.isTrue(SmartPaste.isAbsoluteUrl('https://www.site.com/refId,56511/refDownload.pml'));
    assert.isTrue(SmartPaste.isAbsoluteUrl('https://www.site.com/:w:/s/b026324c6904b2a9cb4b88d6d61c81d1?q=abc123'));
    assert.isTrue(SmartPaste.isAbsoluteUrl('https://site.com/test/!test'));
    assert.isFalse(SmartPaste.isAbsoluteUrl('file.gif'));
    assert.isFalse(SmartPaste.isAbsoluteUrl(''));
  });

  it('TBA: isImageUrl', () => {
    const editor = hook.editor();
    assert.isFalse(SmartPaste.isImageUrl(editor, 'http://www.site.com'));
    assert.isFalse(SmartPaste.isImageUrl(editor, 'https://www.site.com'));
    assert.isTrue(SmartPaste.isImageUrl(editor, 'http://www.site.com/dir-name/file.jpeg'));
    assert.isTrue(SmartPaste.isImageUrl(editor, 'http://www.site.com/dir-name/file.jpg'));
    assert.isTrue(SmartPaste.isImageUrl(editor, 'http://www.site.com/dir-name/file.png'));
    assert.isTrue(SmartPaste.isImageUrl(editor, 'http://www.site.com/dir-name/file.gif'));
    assert.isTrue(SmartPaste.isImageUrl(editor, 'https://www.site.com/dir-name/file.gif'));
    assert.isTrue(SmartPaste.isImageUrl(editor, 'https://www.site.com/~dir-name/file.gif'));
    assert.isFalse(SmartPaste.isImageUrl(editor, 'https://www.site.com/dir-name/file.gif?query=%42'));
    assert.isFalse(SmartPaste.isImageUrl(editor, 'https://www.site.com/dir-name/file.html?query=%42'));
    assert.isFalse(SmartPaste.isImageUrl(editor, 'file.gif'));
    assert.isFalse(SmartPaste.isImageUrl(editor, ''));
  });

  it('TINY-6306: New images_file_types defaults', () => {
    const editor = hook.editor();
    Arr.map([
      'jpeg',
      'jpg',
      'jpe',
      'jfi',
      'jfif',
      'png',
      'gif',
      'bmp',
      'webp',
      'PNG',
      'WEBP',
    ], (image_file_type) => assert.isTrue(
      SmartPaste.isImageUrl(editor, `https://www.site.com/file.${image_file_type}`),
      `File type "${image_file_type}" is valid`
    ));

    assert.isFalse(
      SmartPaste.isImageUrl(editor, 'https://www.site.com/file.svg'),
      'File type "svg" is invalid by default'
    );

    assert.isFalse(
      SmartPaste.isImageUrl(editor, 'https://www.site.com/filejpeg'),
      'Missing "." but valid extension'
    );
  });

  it('TINY-6306: New images_file_types settings', () => {
    const editor = hook.editor();
    editor.options.set('images_file_types', 'svg');
    assert.isTrue(
      SmartPaste.isImageUrl(editor, 'https://www.site.com/file.svg'),
      'File type "svg" is valid when set by settings'
    );
    assert.isTrue(
      SmartPaste.isImageUrl(editor, 'https://www.site.com/file.SVG'),
      'File type "SVG" (capitals) is valid when set by settings'
    );
    editor.options.unset('images_file_types');
  });

  context('Smart paste enabled', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('smart_paste', true);
    });

    it('TINY-6306: with custom images_file_types settings', () => {
      const editor = hook.editor();
      editor.resetContent('<p></p>');
      LegacyUnit.setSelection(editor, 'p', 0);
      editor.undoManager.add();

      // svg not detected as an image
      editor.execCommand('mceInsertClipboardContent', false, { html: 'http://www.site.com/my.svg' });
      TinyAssertions.assertContent(editor, '<p>http://www.site.com/my.svg</p>');

      editor.resetContent('<p></p>');
      LegacyUnit.setSelection(editor, 'p', 0);
      editor.undoManager.add();

      // svg detected as image
      editor.options.set('images_file_types', 'svg');
      editor.execCommand('mceInsertClipboardContent', false, { html: 'http://www.site.com/my.svg' });
      TinyAssertions.assertContent(editor, '<p><img src="http://www.site.com/my.svg"></p>');

      editor.options.unset('images_file_types');
    });

    it('TBA: paste as content, paste url on selection', () => {
      const editor = hook.editor();
      editor.resetContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
      editor.undoManager.add();

      editor.execCommand('mceInsertClipboardContent', false, { html: 'http://www.site.com' });
      TinyAssertions.assertContent(editor, '<p><a href="http://www.site.com">abc</a></p>');
      assert.lengthOf(editor.undoManager.data, 3);
    });

    it('TBA: paste as content, paste image url', () => {
      const editor = hook.editor();
      editor.resetContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 1);
      editor.undoManager.add();

      editor.execCommand('mceInsertClipboardContent', false, { html: 'http://www.site.com/my.jpg' });
      TinyAssertions.assertContent(editor, '<p>a<img src="http://www.site.com/my.jpg">bc</p>');
      assert.lengthOf(editor.undoManager.data, 3);
    });

    it('TINY-4523: paste as text, paste image url', () => {
      const editor = hook.editor();
      editor.resetContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 1);
      editor.undoManager.add();

      editor.execCommand('mceInsertClipboardContent', false, { text: 'http://www.site.com/my.jpg' });
      TinyAssertions.assertContent(editor, '<p>ahttp://www.site.com/my.jpgbc</p>');
      assert.lengthOf(editor.undoManager.data, 2);
    });

    it('TINY-4523: paste as content, paste link html', () => {
      const editor = hook.editor();
      editor.resetContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 1);
      editor.undoManager.add();

      editor.execCommand('mceInsertClipboardContent', false, { html: '<img src="http://www.site.com/my.jpg" />' });
      TinyAssertions.assertContent(editor, '<p>a<img src="http://www.site.com/my.jpg">bc</p>');
      assert.lengthOf(editor.undoManager.data, 2);
    });

    it('TINY-4523: paste as text, paste link html', () => {
      const editor = hook.editor();
      editor.resetContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 1);
      editor.undoManager.add();

      editor.execCommand('mceInsertClipboardContent', false, { text: '<img src="http://www.site.com/my.jpg" />' });
      TinyAssertions.assertContent(editor, '<p>a&lt;img src=\"http://www.site.com/my.jpg\" /&gt;bc</p>');
      assert.lengthOf(editor.undoManager.data, 2);
    });
  });

  context('Smart paste disabled', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('smart_paste', false);
    });

    it('TBA: paste as content, paste image url', () => {
      const editor = hook.editor();
      editor.resetContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 1);
      editor.undoManager.add();

      editor.execCommand('mceInsertClipboardContent', false, { html: 'http://www.site.com/my.jpg' });
      TinyAssertions.assertContent(editor, '<p>ahttp://www.site.com/my.jpgbc</p>');
      assert.lengthOf(editor.undoManager.data, 2);
    });

    it('TINY-4523: paste as text, paste image url', () => {
      const editor = hook.editor();
      editor.resetContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 1);
      editor.undoManager.add();

      editor.execCommand('mceInsertClipboardContent', false, { text: 'http://www.site.com/my.jpg' });
      TinyAssertions.assertContent(editor, '<p>ahttp://www.site.com/my.jpgbc</p>');
      assert.lengthOf(editor.undoManager.data, 2);
    });

    it('TINY-4523: paste as content, paste link html', () => {
      const editor = hook.editor();
      editor.focus();
      editor.resetContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 1);
      editor.undoManager.add();

      editor.execCommand('mceInsertClipboardContent', false, { html: '<img src="http://www.site.com/my.jpg" />' });
      TinyAssertions.assertContent(editor, '<p>a<img src="http://www.site.com/my.jpg">bc</p>');
      assert.lengthOf(editor.undoManager.data, 2);
    });

    it('TINY-4523: paste as text, paste link html', () => {
      const editor = hook.editor();
      editor.resetContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 1);
      editor.undoManager.add();

      editor.execCommand('mceInsertClipboardContent', false, { text: '<img src="http://www.site.com/my.jpg" />' });
      TinyAssertions.assertContent(editor, '<p>a&lt;img src=\"http://www.site.com/my.jpg\" /&gt;bc</p>');
      assert.lengthOf(editor.undoManager.data, 2);
    });
  });
});
