import { Clipboard as AgarClipboard, Waiter } from '@ephox/agar';
import { afterEach, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Fun, Singleton } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as Clipboard from 'tinymce/core/paste/Clipboard';

import * as PasteEventUtils from '../../module/test/PasteEventUtils';

describe('browser.tinymce.core.paste.ImagePasteTest', () => {
  const lastBeforeInputEvent = Singleton.value<EditorEvent<InputEvent>>();
  const lastInputEvent = Singleton.value<EditorEvent<InputEvent>>();

  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    automatic_uploads: false,
    paste_data_images: true,
    base_url: '/project/tinymce/js/tinymce',
    init_instance_callback: (editor: Editor) => {
      editor.on('beforeinput', (e) => lastBeforeInputEvent.set(e));
      editor.on('input', (e) => lastInputEvent.set(e));
    }
  }, []);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
  });

  afterEach(() => {
    const editor = hook.editor();
    editor.editorUpload.destroy();
    lastBeforeInputEvent.clear();
    lastInputEvent.clear();
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

    return new window.File([ bytes ], filename, { type });
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

  const pAssertInputEvents = () => PasteEventUtils.pWaitForAndAssertInputEvents(lastBeforeInputEvent, lastInputEvent);

  it('TBA: pasteImages should set unique id in blobcache', async () => {
    const editor = hook.editor();

    const hasCachedItem = (name: string) => !!editor.editorUpload.blobCache.get(name);

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif'),
      base64ToBlob(base64ImgSrc2, 'image/gif', 'image.gif')
    ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await pAssertInputEvents();
    await pWaitForSelector(editor, 'img');
    await Waiter.pTryUntilPredicate('Wait for image to be cached', () => hasCachedItem('mceclip0') && hasCachedItem('mceclip1'));

    const cachedBlob1 = editor.editorUpload.blobCache.get('mceclip0');
    const cachedBlob2 = editor.editorUpload.blobCache.get('mceclip1');
    assert.equal(cachedBlob1?.base64(), base64ImgSrc);
    assert.equal(cachedBlob2?.base64(), base64ImgSrc2);
  });

  it('TBA: dropImages', async () => {
    const editor = hook.editor();

    const event = mockEvent('drop', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif')
    ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await pAssertInputEvents();
    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '">a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);
  });

  it('TBA: pasteImages', async () => {
    const editor = hook.editor();

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif')
    ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '">a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);
  });

  it('TINY-6622: pasteImages with reuse filename', async () => {
    const editor = hook.editor();
    editor.options.set('images_reuse_filename', true);

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/jpeg', 'image.jfif')
    ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await pAssertInputEvents();
    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src="data:image/jpeg;base64,' + base64ImgSrc + '">a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

    const blobInfo = editor.editorUpload.blobCache.getByData(base64ImgSrc, 'image/jpeg');
    assert.equal(blobInfo?.filename(), 'image.jfif');

    editor.options.unset('images_reuse_filename');
  });

  it('TINY-6306: pasteImages with custom file types', async () => {
    const editor = hook.editor();
    editor.options.set('images_file_types', 'svg,tiff');

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/tiff', 'image.tiff')
    ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await pAssertInputEvents();
    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/tiff;base64,' + base64ImgSrc + '">a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

    editor.options.unset('images_file_types');
  });

  it('TINY-8079: Should filter items that are not files when pasting images', async () => {
    const editor = hook.editor();

    AgarClipboard.pasteDataTransfer(TinyDom.body(editor), (dataTransfer) => {
      dataTransfer.items.add('anything', 'text/ico');
      dataTransfer.items.add(base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif'));
    });

    await pAssertInputEvents();
    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '">a</p>');
  });

  it('TINY-9997: Image urls should be pasted as images', async () => {
    const editor = hook.editor();
    // Have to manually add extra undo level since the setContent in beforeEach does not add one. Since pasting
    // an image url executes the UndoManager.extra method, which involves rolling back the first mutation, not
    // having an undo level here would cause the initial content to be unexpectedly removed during the rollback.
    editor.undoManager.add();

    const imageUrl = 'https://www.example.com/image.jpg';
    AgarClipboard.pasteItems(TinyDom.body(editor), { 'text/plain': imageUrl, 'text/html': imageUrl });

    await pAssertInputEvents();
    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, `<p><img src="${imageUrl}">a</p>`);

    editor.undoManager.undo();
    TinyAssertions.assertContent(editor, `<p>${imageUrl}a</p>`);
  });
});
