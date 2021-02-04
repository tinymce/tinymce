import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as SmartPaste from 'tinymce/plugins/paste/core/SmartPaste';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

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

UnitTest.asynctest('browser.tinymce.plugins.paste.SmartPasteTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Paste: isAbsoluteUrl', () => {
    LegacyUnit.equal(SmartPaste.isAbsoluteUrl('http://www.site.com'), true);
    LegacyUnit.equal(SmartPaste.isAbsoluteUrl('https://www.site.com'), true);
    LegacyUnit.equal(SmartPaste.isAbsoluteUrl('http://www.site.com/dir-name/file.gif?query=%42'), true);
    LegacyUnit.equal(SmartPaste.isAbsoluteUrl('https://www.site.com/dir-name/file.gif?query=%42'), true);
    LegacyUnit.equal(SmartPaste.isAbsoluteUrl('https://www.site.com/dir-name/file.gif?query=%42#a'), true);
    LegacyUnit.equal(SmartPaste.isAbsoluteUrl('https://www.site.com/~abc'), true);
    LegacyUnit.equal(SmartPaste.isAbsoluteUrl('file.gif'), false);
    LegacyUnit.equal(SmartPaste.isAbsoluteUrl(''), false);
  });

  suite.test('TestCase-TBA: Paste: isImageUrl', (editor) => {
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'http://www.site.com'), false);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'https://www.site.com'), false);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'http://www.site.com/dir-name/file.jpeg'), true);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'http://www.site.com/dir-name/file.jpg'), true);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'http://www.site.com/dir-name/file.png'), true);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'http://www.site.com/dir-name/file.gif'), true);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'https://www.site.com/dir-name/file.gif'), true);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'https://www.site.com/~dir-name/file.gif'), true);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'https://www.site.com/dir-name/file.gif?query=%42'), false);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'https://www.site.com/dir-name/file.html?query=%42'), false);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, 'file.gif'), false);
    LegacyUnit.equal(SmartPaste.isImageUrl(editor, ''), false);
  });

  suite.test('TINY-6306: New images_file_types defaults', (editor) => {
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
    ], (image_file_type) => LegacyUnit.equal(
      SmartPaste.isImageUrl(editor, `https://www.site.com/file.${image_file_type}`),
      true,
      `File type "${image_file_type}" is valid`
    ));

    LegacyUnit.equal(
      SmartPaste.isImageUrl(editor, 'https://www.site.com/file.svg'),
      false,
      'File type "svg" is invalid by default'
    );

    LegacyUnit.equal(
      SmartPaste.isImageUrl(editor, 'https://www.site.com/filejpeg'),
      false,
      'Missing "." but valid extension'
    );
  });

  suite.test('TINY-6306: New images_file_types settings', (editor) => {
    editor.settings.images_file_types = 'svg';
    LegacyUnit.equal(
      SmartPaste.isImageUrl(editor, 'https://www.site.com/file.svg'),
      true,
      'File type "svg" is valid when set by settings'
    );
    LegacyUnit.equal(
      SmartPaste.isImageUrl(editor, 'https://www.site.com/file.SVG'),
      true,
      'File type "SVG" (capitals) is valid when set by settings'
    );
    delete editor.settings.images_file_types;
  });

  suite.test('TINY-6306: Smart paste enabled (with custom images_file_types settings)', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p></p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.undoManager.add();
    editor.settings.smart_paste = true;

    // svg not detected as an image
    editor.execCommand('mceInsertClipboardContent', false, { content: 'http://www.site.com/my.svg' });
    LegacyUnit.equal(editor.getContent(), '<p>http://www.site.com/my.svg</p>');

    editor.undoManager.clear();
    editor.setContent('<p></p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.undoManager.add();

    // svg detected as image
    editor.settings.images_file_types = 'svg';
    editor.execCommand('mceInsertClipboardContent', false, { content: 'http://www.site.com/my.svg' });
    LegacyUnit.equal(editor.getContent(), '<p><img src="http://www.site.com/my.svg" /></p>');

    delete editor.settings.images_file_types;
  });

  suite.test('TestCase-TBA: Paste: smart paste enabled, paste as content, paste url on selection', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
    editor.undoManager.add();
    editor.settings.smart_paste = true;

    editor.execCommand('mceInsertClipboardContent', false, { content: 'http://www.site.com' });
    LegacyUnit.equal(editor.getContent(), '<p><a href="http://www.site.com">abc</a></p>');
    LegacyUnit.equal(editor.undoManager.data.length, 3);
  });

  suite.test('TestCase-TBA: Paste: smart paste enabled, paste as content, paste image url', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.undoManager.add();
    editor.settings.smart_paste = true;

    editor.execCommand('mceInsertClipboardContent', false, { content: 'http://www.site.com/my.jpg' });
    LegacyUnit.equal(editor.getContent(), '<p>a<img src="http://www.site.com/my.jpg" />bc</p>');
    LegacyUnit.equal(editor.undoManager.data.length, 3);
  });

  suite.test('TestCase-TBA: Paste: smart paste disabled, paste as content, paste image url', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.undoManager.add();
    editor.settings.smart_paste = false;

    editor.execCommand('mceInsertClipboardContent', false, { content: 'http://www.site.com/my.jpg' });
    LegacyUnit.equal(editor.getContent(), '<p>ahttp://www.site.com/my.jpgbc</p>');
    LegacyUnit.equal(editor.undoManager.data.length, 2);
  });

  suite.test('TINY-4523: Paste: smart paste enabled, paste as text, paste image url', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.undoManager.add();
    editor.settings.smart_paste = true;

    editor.execCommand('mceInsertClipboardContent', false, { text: 'http://www.site.com/my.jpg' });
    LegacyUnit.equal(editor.getContent(), '<p>ahttp://www.site.com/my.jpgbc</p>');
    LegacyUnit.equal(editor.undoManager.data.length, 2);
  });

  suite.test('TINY-4523: Paste: smart paste disabled, paste as text, paste image url', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.undoManager.add();
    editor.settings.smart_paste = false;

    editor.execCommand('mceInsertClipboardContent', false, { text: 'http://www.site.com/my.jpg' });
    LegacyUnit.equal(editor.getContent(), '<p>ahttp://www.site.com/my.jpgbc</p>');
    LegacyUnit.equal(editor.undoManager.data.length, 2);
  });

  suite.test('TINY-4523: Paste: smart paste enabled, paste as content, paste link html', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.undoManager.add();
    editor.settings.smart_paste = true;

    editor.execCommand('mceInsertClipboardContent', false, { content: '<img src="http://www.site.com/my.jpg" />' });
    LegacyUnit.equal(editor.getContent(), '<p>a<img src="http://www.site.com/my.jpg" />bc</p>');
    LegacyUnit.equal(editor.undoManager.data.length, 2);
  });

  suite.test('TINY-4523: Paste: smart paste disabled, paste as content, paste link html', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.undoManager.add();
    editor.settings.smart_paste = false;

    editor.execCommand('mceInsertClipboardContent', false, { content: '<img src="http://www.site.com/my.jpg" />' });
    LegacyUnit.equal(editor.getContent(), '<p>a<img src="http://www.site.com/my.jpg" />bc</p>');
    LegacyUnit.equal(editor.undoManager.data.length, 2);
  });

  suite.test('TINY-4523: Paste: smart paste enabled, paste as text, paste link html', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.undoManager.add();
    editor.settings.smart_paste = true;

    editor.execCommand('mceInsertClipboardContent', false, { text: '<img src="http://www.site.com/my.jpg" />' });
    LegacyUnit.equal(editor.getContent(), '<p>a&lt;img src=\"http://www.site.com/my.jpg\" /&gt;bc</p>');
    LegacyUnit.equal(editor.undoManager.data.length, 2);
  });

  suite.test('TINY-4523: Paste: smart paste disabled, paste as text, paste link html', (editor) => {
    editor.focus();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.undoManager.add();
    editor.settings.smart_paste = false;

    editor.execCommand('mceInsertClipboardContent', false, { text: '<img src="http://www.site.com/my.jpg" />' });
    LegacyUnit.equal(editor.getContent(), '<p>a&lt;img src=\"http://www.site.com/my.jpg\" /&gt;bc</p>');
    LegacyUnit.equal(editor.undoManager.data.length, 2);
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, Log.steps('TBA', 'Paste: Test smart paste', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    indent: false,
    plugins: 'paste',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
