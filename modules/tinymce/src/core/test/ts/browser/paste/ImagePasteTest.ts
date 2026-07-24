import { Clipboard as AgarClipboard, Waiter } from '@ephox/agar';
import { afterEach, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Singleton, Type } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
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
  const base64150x100ImgSrc = [
    'iVBORw0KGgoAAAANSUhEUgAAAJYAAABkCAIAAADrOV6nAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9k',
    'b9Lw0AcxV9TtSItCnYQcQhYneyiIo61CkWoEGqFVh1MLv0FTRqSFhdHwbXg4I/FqoOLs64OroIg+A',
    'PEP0CcFF2kxO8lhRYxHhz34d29x907QGiUmWZ1xQBNr5qpRFzMZFfFwCt6MIAQRhGVmWXMSVISnuP',
    'rHj6+3kV5lve5P0dIzVkM8InEMWaYVeIN4pnNqsF5nzjMirJKfE48YdIFiR+5rrj8xrngsMAzw2Y6',
    'NU8cJhYLHax0MCuaGvE0cUTVdMoXMi6rnLc4a+Uaa92TvzCY01eWuU5zBAksYgkSRCiooYQyqojSq',
    'pNiIUX7cQ//sOOXyKWQqwRGjgVUoEF2/OB/8LtbKz816SYF40D3i21/jAGBXaBZt+3vY9tungD+Z+',
    'BKb/srDWD2k/R6W4scAf3bwMV1W1P2gMsdYOjJkE3Zkfw0hXweeD+jb8oCg7dA35rbW2sfpw9Amrp',
    'K3gAHh8B4gbLXPd7d29nbv2da/f0AwepyxuBy6bwAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElN',
    'RQfqBhANKgjNOucyAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAEJJREFUe',
    'NrtwQENAAAAwqD3T20PBxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAfBmwLAAB/Cm0ZAAAAABJRU5ErkJggg=='
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

  // Pasted images load asynchronously; wait for the img elements to finish loading
  // so their load handlers don't settle after teardown and corrupt a later test.
  const pWaitForImagesLoaded = (editor: Editor, count: number) =>
    Waiter.pTryUntilPredicate('Wait for images to finish loading', () => {
      const imgs = editor.dom.select('img') as HTMLImageElement[];
      return imgs.length === count && Arr.forall(imgs, (img) => img.complete && img.naturalWidth > 0);
    });

  it('TBA: pasteImages should set unique id in blobcache', async () => {
    const editor = hook.editor();

    // The mceclip blob-id counter is module-level and advanced by any earlier image
    // paste, so look entries up by data rather than asserting literal mceclipN ids.
    const getCachedByData = (base64: string) => editor.editorUpload.blobCache.getByData(base64, 'image/gif');

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif'),
      base64ToBlob(base64ImgSrc2, 'image/gif', 'image.gif')
    ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await pAssertInputEvents();
    await pWaitForSelector(editor, 'img');
    await Waiter.pTryUntilPredicate('Wait for images to be cached', () =>
      Type.isNonNullable(getCachedByData(base64ImgSrc)) && Type.isNonNullable(getCachedByData(base64ImgSrc2)));

    const cachedBlob1 = getCachedByData(base64ImgSrc);
    const cachedBlob2 = getCachedByData(base64ImgSrc2);
    assert.equal(cachedBlob1?.base64(), base64ImgSrc);
    assert.equal(cachedBlob2?.base64(), base64ImgSrc2);
    assert.match(cachedBlob1?.id() ?? '', /^mceclip\d+$/, 'first image should have an mceclip id');
    assert.match(cachedBlob2?.id() ?? '', /^mceclip\d+$/, 'second image should have an mceclip id');
    assert.notEqual(cachedBlob1?.id(), cachedBlob2?.id(), 'pasted images should have unique ids');

    await pWaitForImagesLoaded(editor, 2);
  });

  it('TBA: dropImages', async () => {
    const editor = hook.editor();

    const event = mockEvent('drop', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif')
    ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    await pWaitForImagesLoaded(editor, 1);
    await pAssertInputEvents();
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" width="100" height="100">a</p>');
    assert.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);
  });

  it('TBA: pasteImages', async () => {
    const editor = hook.editor();

    const event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif', 'image.gif')
    ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" width="100" height="100">a</p>');
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
    TinyAssertions.assertContent(editor, '<p><img src="data:image/jpeg;base64,' + base64ImgSrc + '" width="100" height="100">a</p>');
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
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/tiff;base64,' + base64ImgSrc + '" width="100" height="100">a</p>');
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
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" width="100" height="100">a</p>');
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

  it('TINY-14411: Paste an image should add width and height to the image', async () => {
    const editor = hook.editor();

    AgarClipboard.pasteDataTransfer(TinyDom.body(editor), (dataTransfer) => {
      dataTransfer.items.add('anything', 'text/ico');
      dataTransfer.items.add(base64ToBlob(base64150x100ImgSrc, 'image/gif', 'image.gif'));
    });

    await pAssertInputEvents();
    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, '<p><img src=\"data:image/gif;base64,' + base64150x100ImgSrc + '" width="150" height="100">a</p>');
  });

  it('TINY-14411: Pasting a broken image should still insert it without width and height', async () => {
    const editor = hook.editor();

    // Raw bytes that are not valid image data — browser fires error event when loading as img
    const invalidBytes = new Uint8Array([ 0x00, 0x01, 0x02, 0x03 ]);
    const invalidFile = new window.File([ invalidBytes ], 'broken.gif', { type: 'image/gif' });
    const expectedBase64 = btoa(Array.from(invalidBytes).map((b) => String.fromCharCode(b)).join(''));

    const event = mockEvent('paste', [ invalidFile ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await pAssertInputEvents();
    await pWaitForSelector(editor, 'img');
    TinyAssertions.assertContent(editor, `<p><img src="data:image/gif;base64,${expectedBase64}">a</p>`);
  });

  it('TINY-14411: Pasting multiple images where one is broken should paste all of them', async () => {
    const editor = hook.editor();

    const invalidBytes = new Uint8Array([ 0x00, 0x01, 0x02, 0x03 ]);
    const invalidFile = new window.File([ invalidBytes ], 'broken.gif', { type: 'image/gif' });
    const validFile = base64ToBlob(base64150x100ImgSrc, 'image/gif', 'valid.gif');

    const event = mockEvent('paste', [ invalidFile, validFile ]);
    Clipboard.pasteImageData(editor, event, editor.selection.getRng());

    await Waiter.pTryUntilPredicate('Wait for 2 images to be pasted', () => editor.dom.select('img').length === 2);

    const imgs = editor.dom.select('img');
    assert.equal(imgs.length, 2, 'Both images should be pasted');
    await pWaitForSelector(editor, 'img:nth-child(2)');
    const imgsWithDimensions = imgs.filter((img) => img.hasAttribute('width') && img.hasAttribute('height'));
    assert.equal(imgsWithDimensions.length, 1, 'Only the valid image should have width and height');
  });
});
