import { Clipboard as AgarClipboard, Waiter } from '@ephox/agar';
import { afterEach, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Cell, Fun } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Clipboard } from 'tinymce/plugins/paste/api/Clipboard';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.paste.ImagePasteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    automatic_uploads: false,
    paste_data_images: true,
    plugins: 'paste',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
  });

  afterEach(() => {
    const editor = hook.editor();
    editor.editorUpload.destroy();
  });

  const base64ImgSrc = [
    'R0lGODdhZABkAHcAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgAAACwAAAAAZABkAIEAAAD78jY/',
    'P3SsMjIC/4SPqcvtD6OctNqLs968+w+G4kiW5ommR8C27gvHrxrK9g3TIM7f+tcL5n4doZFFLB6F',
    'Sc6SCRFIp9SqVTp6BiPXbjer5XG95Ck47IuWy2e0bLz2tt3DR5w8p7vgd2tej6TW5ycCGMM3aFZo',
    'OCOYqFjDuOf4KPAHiPh4qZeZuEnXOfjpFto3ilZ6dxqWGreq1br2+hTLtigZaFcJuYOb67DLC+Qb',
    'UIt3i2sshyzZtEFc7JwBLT1NXI2drb3N3e39DR4uPk5ebn6Onq6+zu488A4fLz9P335Aj58fb2+g',
    '71/P759AePwADBxY8KDAhAr9MWyY7yFEgPYmRgxokWK7jEYa2XGcJ/HjgJAfSXI0mRGlRZUTWUJ0',
    '2RCmQpkHaSLEKPKdzYU4c+78VzCo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9eqEAADs='
  ].join('');
  const base64ImgSrc2 = 'R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

  const base64ToBlob = (base64: string, type: string, filename: string): File => {
    const buff = atob(base64);
    const bytes = new Uint8Array(buff.length);

    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = buff.charCodeAt(i);
    }

    // Note: We need to mock creating a File due to IE not supporting the File constructor
    const file = new Blob([ bytes ], { type }) as any;
    file.name = filename;
    return file;
  };

  const mockEvent = <K extends 'drop' | 'paste'>(type: K, files: File[]): K extends 'drop' ? DragEvent : ClipboardEvent => {
    const transferName = type === 'drop' ? 'dataTransfer' : 'clipboardData';
    return {
      type,
      preventDefault: Fun.noop,
      [transferName]: { files }
    } as any;
  };

  const pWaitForSelector = (editor: Editor, selector: string) =>
    Waiter.pTryUntilPredicate(`Wait for ${selector} to exist`, () => editor.dom.select(selector).length > 0);

  it('TBA: pasteImages should set unique id in blobcache', async () => {
    const editor = hook.editor();
    const clipboard = Clipboard(editor, Cell('html'));

    const hasCachedItem = (name) => !!editor.editorUpload.blobCache.get(name);

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif'),
      base64ToBlob(base64ImgSrc2, 'image/gif', 'image.gif')
    ]);
    clipboard.pasteImageData(event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    await Waiter.pTryUntilPredicate('Wait for image to be cached', () => hasCachedItem('mceclip0') && hasCachedItem('mceclip1'));

    const cachedBlob1 = editor.editorUpload.blobCache.get('mceclip0');
    const cachedBlob2 = editor.editorUpload.blobCache.get('mceclip1');
    assert.equal(cachedBlob1.base64(), base64ImgSrc);
    assert.equal(cachedBlob2.base64(), base64ImgSrc2);
  });

  it('TBA: dropImages', async () => {
    const editor = hook.editor();
    const clipboard = Clipboard(editor, Cell('html'));

    const event = mockEvent('drop', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif')
    ]);
    clipboard.pasteImageData(event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);
  });

  it('TBA: pasteImages', async () => {
    const editor = hook.editor();
    const clipboard = Clipboard(editor, Cell('html'));

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif')
    ]);
    clipboard.pasteImageData(event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);
  });

  it('TINY-6622: pasteImages with reuse filename', async () => {
    const editor = hook.editor();
    editor.settings.images_reuse_filename = true;
    const clipboard = Clipboard(editor, Cell('html'));

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/jpeg', 'image.jfif')
    ]);
    clipboard.pasteImageData(event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src="data:image/jpeg;base64,' + base64ImgSrc + '" />a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

    const blobInfo = editor.editorUpload.blobCache.getByData(base64ImgSrc, 'image/jpeg');
    assert.equal(blobInfo.filename(), 'image.jfif');

    delete editor.settings.images_reuse_filename;
  });

  it('TINY-6306: pasteImages with custom file types', async () => {
    const editor = hook.editor();
    editor.settings.images_file_types = 'svg,tiff';
    const clipboard = Clipboard(editor, Cell('html'));

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/tiff', 'image.tiff')
    ]);
    clipboard.pasteImageData(event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/tiff;base64,' + base64ImgSrc + '" />a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

    delete editor.settings.images_file_types;
  });

  it('TBA: dropImages - images_dataimg_filter', async () => {
    const editor = hook.editor();
    const clipboard = Clipboard(editor, Cell('html'));

    editor.settings.images_dataimg_filter = (img: HTMLImageElement) => {
      assert.strictEqual(img.src, 'data:image/gif;base64,' + base64ImgSrc);
      return false;
    };

    const event = mockEvent('drop', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif')
    ]);
    clipboard.pasteImageData(event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

    delete editor.settings.images_dataimg_filter;
  });

  it('TBA: pasteImages - images_dataimg_filter', async () => {
    const editor = hook.editor();
    const clipboard = Clipboard(editor, Cell('html'));

    editor.settings.images_dataimg_filter = (img: HTMLImageElement) => {
      assert.strictEqual(img.src, 'data:image/gif;base64,' + base64ImgSrc);
      return false;
    };

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif')
    ]);
    clipboard.pasteImageData(event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

    delete editor.settings.images_dataimg_filter;
  });

  it('TINY-8079: Should filter items that are not files when pasting images', async () => {
    const editor = hook.editor();

    AgarClipboard.pasteDataTransfer(TinyDom.body(editor), (dataTransfer) => {
      dataTransfer.items.add('anything', 'text/ico');
      dataTransfer.items.add(base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif'));
    });

    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
  });
});
