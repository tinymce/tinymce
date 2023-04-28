import { afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { UploadResult } from 'tinymce/core/api/EditorUpload';
import Env from 'tinymce/core/api/Env';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as Conversions from 'tinymce/core/file/Conversions';

const assertResult = (editor: Editor, title: string, uploadUri: string, uploadedBlobInfo: BlobInfo, result: UploadResult[], ext: string = '.png') => {
  const firstResult = result[0];
  assert.lengthOf(result, 1, title);
  assert.isTrue(firstResult.status, title);
  assert.include(firstResult.element.src, uploadedBlobInfo.id() + ext, title);
  assert.equal(uploadUri, firstResult.uploadUri, title);
  assert.equal(uploadedBlobInfo.id(), firstResult.blobInfo.id(), title);
  assert.equal(uploadedBlobInfo.name(), firstResult.blobInfo.name(), title);
  assert.equal(uploadedBlobInfo.filename(), firstResult.blobInfo.filename(), title);
  assert.equal(uploadedBlobInfo.blob(), firstResult.blobInfo.blob(), title);
  assert.equal(uploadedBlobInfo.base64(), firstResult.blobInfo.base64(), title);
  assert.equal(uploadedBlobInfo.blobUri(), firstResult.blobInfo.blobUri(), title);
  assert.equal(uploadedBlobInfo.uri(), firstResult.blobInfo.uri(), title);
  assert.equal(editor.getContent(), '<p><img src="' + uploadedBlobInfo.filename() + '"></p>', title);

  return result;
};

const random = (min: number, max: number) =>
  Math.round(Math.random() * (max - min) + min);

const randBlobDataUri = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(Arr.range(imageData.data.length, () => random(0, 255)));
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

const hasBlobAsSource = (elm: HTMLImageElement) => elm.src.indexOf('blob:') === 0;
const imageHtml = (uri: string) => DOMUtils.DOM.createHTML('img', { src: uri });

describe('browser.tinymce.core.EditorUploadTest', () => {
  let testBlobDataUri: string;
  let changeEvents: Array<EditorEvent<{}>> = [];

  const appendEvent = (event: EditorEvent<{}>) => changeEvents.push(event);
  const clearEvents = () => changeEvents = [];
  const assertEventsLength = (length: number) => assert.lengthOf(changeEvents, length, 'Correct events length');

  const setInitialContent = (editor: Editor, content: string) => {
    editor.resetContent(content);
    clearEvents();
  };

  before(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 200;

    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, 160, 100);
    context.fillStyle = '#00ff00';
    context.fillRect(160, 0, 160, 100);
    context.fillStyle = '#0000ff';
    context.fillRect(0, 100, 160, 100);
    context.fillStyle = '#ff00ff';
    context.fillRect(160, 100, 160, 100);

    testBlobDataUri = canvas.toDataURL();

    return Conversions.uriToBlob(testBlobDataUri);
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    automatic_uploads: false,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => ed.on('change', appendEvent)
  }, []);

  afterEach(() => {
    const editor = hook.editor();
    editor.editorUpload.destroy();
    editor.options.set('automatic_uploads', false);
    editor.options.unset('images_replace_blob_uris');
    clearEvents();
  });

  it('TBA: _scanForImages', () => {
    const editor = hook.editor();
    setInitialContent(editor, imageHtml(testBlobDataUri));

    return editor._scanForImages().then((result) => {
      const blobInfo = result[0].blobInfo;

      assert.equal('data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64(), testBlobDataUri, '_scanForImages');
      assert.equal(editor.getBody().innerHTML, '<p><img src="' + blobInfo.blobUri() + '"></p>', '_scanForImages');
      assert.equal(
        editor.getContent(),
        '<p><img src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '"></p>',
        '_scanForImages'
      );
      assert.deepEqual(blobInfo, editor.editorUpload.blobCache.get(blobInfo.id()), '_scanForImages');
    });
  });

  it('TBA: replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)', () => {
    const editor = hook.editor();
    editor.options.set('automatic_uploads', true);
    editor.options.set('images_upload_handler', (_data: BlobInfo) => {
      return Promise.resolve('file.png');
    });

    setInitialContent(editor, imageHtml(testBlobDataUri));

    return editor._scanForImages().then((result) => {
      const blobUri = result[0].blobInfo.blobUri();

      assertEventsLength(0);
      return editor.uploadImages().then(() => {
        editor.setContent(imageHtml(blobUri));
        assert.isFalse(hasBlobAsSource(editor.dom.select('img')[0]), 'replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)');
        assert.equal(editor.getContent(), '<p><img src="file.png"></p>', 'replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)');
        assertEventsLength(1);
      });
    });
  });

  it(`TBA: don't replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri) since blob uris are retained`, () => {
    const editor = hook.editor();
    editor.options.set('images_replace_blob_uris', false);
    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.options.set('images_upload_handler', (_data: BlobInfo) => {
      return Promise.resolve('file.png');
    });

    return editor._scanForImages().then((result) => {
      const blobUri = result[0].blobInfo.blobUri();

      assertEventsLength(0);
      return editor.uploadImages().then(() => {
        assertEventsLength(0);
        editor.setContent(imageHtml(blobUri));
        assert.isTrue(hasBlobAsSource(editor.dom.select('img')[0]), 'Has blob');
        assert.equal(editor.getContent(), '<p><img src="file.png"></p>', 'contains image');
      });
    });
  });

  it('TBA: uploadImages (callback)', () => {
    const editor = hook.editor();
    let uploadedBlobInfo: BlobInfo;
    let uploadUri: string;

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.options.set('images_upload_handler', (data: BlobInfo) => {
      uploadedBlobInfo = data;
      uploadUri = data.id() + '.png';
      return Promise.resolve(uploadUri);
    });

    assertEventsLength(0);
    return editor.uploadImages().then((firstResult) => {
      assertResult(editor, 'Upload the images', uploadUri, uploadedBlobInfo, firstResult);
      assertEventsLength(1);
      return editor.uploadImages().then((secondResult) => {
        assert.lengthOf(secondResult, 0, 'Upload the images');
      });
    });
  });

  it('TBA: uploadImages (promise)', () => {
    const editor = hook.editor();
    let uploadedBlobInfo: BlobInfo | null;
    let uploadUri: string;

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.options.set('images_upload_handler', (data: BlobInfo) => {
      uploadedBlobInfo = data;
      uploadUri = data.id() + '.png';
      return Promise.resolve(uploadUri);
    });

    assertEventsLength(0);
    return editor.uploadImages().then((result) => {
      assertResult(editor, 'Upload the images', uploadUri, uploadedBlobInfo as BlobInfo, result);
      assertEventsLength(1);
    }).then(() => {
      uploadedBlobInfo = null;

      return editor.uploadImages().then((result) => {
        assert.lengthOf(result, 0, 'Upload the images');
        assert.isNull(uploadedBlobInfo, 'Upload the images');
      });
    });
  });

  it('TBA: uploadImages retain blob urls after upload', () => {
    const editor = hook.editor();
    let uploadedBlobInfo: BlobInfo | null;

    const assertResultRetainsUrl = (results: UploadResult[]) => {
      assert.isTrue(results[0].status, 'uploadImages retain blob urls after upload');
      assert.isTrue(hasBlobAsSource(results[0].element), 'Not a blob url');
      assert.equal(editor.getContent(), '<p><img src="' + uploadedBlobInfo?.filename() + '"></p>', 'uploadImages retain blob urls after upload');

      return results;
    };

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.options.set('images_replace_blob_uris', false);
    editor.options.set('images_upload_handler', (data: BlobInfo) => {
      uploadedBlobInfo = data;
      return Promise.resolve(data.id() + '.png');
    });

    assertEventsLength(0);
    return editor.uploadImages().then((results) => {
      assertResultRetainsUrl(results);
      uploadedBlobInfo = null;
      assertEventsLength(0);

      return editor.uploadImages().then((result) => {
        assert.lengthOf(result, 0, 'uploadImages retain blob urls after upload');
        assert.isNull(uploadedBlobInfo, 'uploadImages retain blob urls after upload');
      });
    });
  });

  it('TBA: uploadImages reuse filename', () => {
    const editor = hook.editor();
    let uploadedBlobInfo: BlobInfo;

    editor.options.set('images_reuse_filename', true);
    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.options.set('images_upload_handler', (data: BlobInfo) => {
      uploadedBlobInfo = data;
      return Promise.resolve('custom.png?size=small');
    });

    const assertResultReusesFilename = (editor: Editor, _uploadedBlobInfo: BlobInfo, result: UploadResult[]) => {
      assert.lengthOf(result, 1, 'uploadImages reuse filename');
      assert.isTrue(result[0].status, 'uploadImages reuse filename');
      assert.equal(editor.getContent(), '<p><img src="custom.png?size=small"></p>', 'uploadImages reuse filename');

      return result;
    };

    assertEventsLength(0);
    return editor.uploadImages().then((result) => {
      assertResultReusesFilename(editor, uploadedBlobInfo, result);

      editor.uploadImages().then((_result) => {
        const img = editor.dom.select('img')[0];
        assertEventsLength(1);
        assert.isFalse(hasBlobAsSource(img), 'uploadImages reuse filename');
        assert.include(img.src, 'custom.png?size=small&', 'Check the cache invalidation string was added');
        assert.equal(editor.getContent(), '<p><img src="custom.png?size=small"></p>', 'uploadImages reuse filename');
        editor.options.unset('images_reuse_filename');
      });
    });
  });

  it('TBA: uploadConcurrentImages', () => {
    const editor = hook.editor();
    let uploadCount = 0, callCount = 0;

    const uploadDone = (result: UploadResult[]) => {
      callCount++;
      assertEventsLength(1);

      if (callCount === 2) {
        assert.equal(uploadCount, 1, 'Should only be one upload.');
      }

      assert.equal(editor.getContent(), '<p><img src="myimage.png"></p>', 'uploadConcurrentImages');
      LegacyUnit.equalDom(result[0].element, editor.dom.select('img')[0]);
      assert.isTrue(result[0].status, 'uploadConcurrentImages');
    };

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.options.set('images_upload_handler', (_data: BlobInfo) => {
      uploadCount++;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('myimage.png');
        }, 0);
      });
    });

    assertEventsLength(0);
    return Promise.all([
      editor.uploadImages().then(uploadDone),
      editor.uploadImages().then(uploadDone)
    ]);
  });

  it('TBA: uploadConcurrentImages (fail)', () => {
    const editor = hook.editor();
    let uploadCount = 0, callCount = 0;

    const uploadDone = (result: UploadResult[]) => {
      callCount++;
      assertEventsLength(0);

      if (callCount === 2) {
        // This is in exact since the status of the image can be pending or failed meaning it should try again
        assert.isAtLeast(uploadCount, 1, 'Should at least be one.');
      }

      LegacyUnit.equalDom(result[0].element, editor.dom.select('img')[0]);
      assert.isFalse(result[0].status, 'uploadConcurrentImages (fail)');
      assert.isEmpty(result[0].uploadUri, 'uploadConcurrentImages (fail)');
    };

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.options.set('images_upload_handler', (_data: BlobInfo) => {
      uploadCount++;

      return new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject('Error');
        }, 0);
      });
    });

    assertEventsLength(0);
    return Promise.all([
      editor.uploadImages().then(uploadDone),
      editor.uploadImages().then(uploadDone)
    ]);
  });

  it('TINY-6011: uploadConcurrentImages fails, with remove', () => {
    const editor = hook.editor();
    let uploadCount = 0;
    let callCount = 0;

    const uploadDone = (result: UploadResult[]) => {
      callCount++;

      if (callCount === 2) {
        // Note: This is 1 as only the removal of the image triggers the addition of an undo level and a change event
        assertEventsLength(1);

        // This is in exact since the status of the image can be pending or failed meaning it should try again
        assert.isAtLeast(uploadCount, 1, 'Should at least be one.');
      }

      assert.isUndefined(editor.dom.select('img')[0], 'No element in the editor');
      assert.isFalse(result[0].status, 'Status is false');
      assert.isEmpty(result[0].uploadUri, 'Uri is empty');
      assert.equal(editor.undoManager.data[0].content, '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-mce-placeholder="1"></p>', 'content is correct');
      assert.lengthOf(editor.undoManager.data, 2, 'Suitable number of stacks added');
    };

    editor.resetContent(imageHtml(testBlobDataUri));

    editor.options.set('images_upload_handler', (_data: BlobInfo) => {
      uploadCount++;

      return new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject({ message: 'Error', remove: true });
        }, 0);
      });
    });

    assertEventsLength(0);
    return Promise.all([
      editor.uploadImages().then(uploadDone),
      editor.uploadImages().then(uploadDone)
    ]);
  });

  it('TINY-8641: 2 successful upload simultaneous should trigger 1 change', () => {
    const editor = hook.editor();
    setInitialContent(editor, `<div>
      ${imageHtml(testBlobDataUri)}
      ${imageHtml(testBlobDataUri + 'someFakeString')}
    </div>`);

    editor.options.set('images_upload_handler', (data: BlobInfo) => {
      return Promise.resolve(data.id() + '.png');
    });

    assertEventsLength(0);
    return editor.uploadImages().then(() => assertEventsLength(1));
  });

  it('TINY-8641: 1 successful upload and 1 fail upload simultaneous should trigger 1 change', () => {
    const editor = hook.editor();
    let firstUploadDone = false;
    setInitialContent(editor, `<div>
      ${imageHtml(testBlobDataUri)}
      ${imageHtml(testBlobDataUri + 'someFakeString')}
    </div>`);

    editor.options.set('images_upload_handler', (data: BlobInfo) => {
      if (!firstUploadDone) {
        firstUploadDone = true;
        return Promise.resolve(data.id() + '.png');
      } else {
        return Promise.reject({ message: 'Error', remove: true });
      }
    });

    assertEventsLength(0);
    return editor.uploadImages().then(() => assertEventsLength(1));
  });

  it('TINY-9696: Removing an image should not leave the containing block without bogus element for p.', async () => {
    const editor = hook.editor();
    setInitialContent(editor, `<p>A</p><p></p><p>${imageHtml(testBlobDataUri)}</p>`);

    editor.options.set('images_upload_handler', () => {
      return Promise.reject({ message: 'Error', remove: true });
    });

    assertEventsLength(0);
    await editor.uploadImages().then(() => {
      assertEventsLength(1);
    });

    TinyAssertions.assertRawContent(editor, '<p>A</p><p><br data-mce-bogus="1"></p><p><br data-mce-bogus="1"></p>');
  });

  it('TINY-9696: Removing an image should not leave the containing block without bogus element for div.', async () => {
    const editor = hook.editor();
    setInitialContent(editor, `<p>A</p><p></p><div>${imageHtml(testBlobDataUri)}</div>`);

    editor.options.set('images_upload_handler', () => {
      return Promise.reject({ message: 'Error', remove: true });
    });

    assertEventsLength(0);
    await editor.uploadImages().then(() => {
      assertEventsLength(1);
    });

    TinyAssertions.assertRawContent(editor, '<p>A</p><p><br data-mce-bogus="1"></p><div><br data-mce-bogus="1"></div>');
  });

  it('TINY-9696: Removing an image should not leave the containing block without bogus element for h1.', async () => {
    const editor = hook.editor();
    setInitialContent(editor, `<p>A</p><p></p><h1>${imageHtml(testBlobDataUri)}</h1>`);

    editor.options.set('images_upload_handler', () => {
      return Promise.reject({ message: 'Error', remove: true });
    });

    assertEventsLength(0);
    await editor.uploadImages().then(() => {
      assertEventsLength(1);
    });

    TinyAssertions.assertRawContent(editor, '<p>A</p><p><br data-mce-bogus="1"></p><h1><br data-mce-bogus="1"></h1>');
  });

  it('TINY-8641: multiple successful upload and multiple fail upload simultaneous should trigger 1 change', () => {
    const editor = hook.editor();
    let successfulUploadsCounter = 0;
    setInitialContent(editor, `<div>
      ${imageHtml(testBlobDataUri)}
      ${imageHtml(testBlobDataUri + 'someFakeString1')}
      ${imageHtml(testBlobDataUri + 'someFakeString2')}
      ${imageHtml(testBlobDataUri + 'someFakeString3')}
    </div>`);

    editor.options.set('images_upload_handler', (data: BlobInfo) => {
      successfulUploadsCounter++;
      if (successfulUploadsCounter < 2) {
        return Promise.resolve(data.id() + '.png');
      } else {
        return Promise.reject({ message: 'Error', remove: true });
      }
    });

    assertEventsLength(0);
    return editor.uploadImages().then(() => assertEventsLength(1));
  });

  it(`TBA: Don't upload transparent image`, () => {
    const editor = hook.editor();
    let uploadCount = 0;

    assertEventsLength(0);
    const uploadDone = () => {
      assertEventsLength(0);
      assert.equal(uploadCount, 0, 'Should not upload.');
    };

    editor.setContent(imageHtml(Env.transparentSrc));

    editor.options.set('images_upload_handler', (_data: BlobInfo) => {
      uploadCount++;
      return Promise.resolve('url');
    });

    return editor.uploadImages().then(uploadDone);
  });

  it(`TBA: Don't upload bogus image`, () => {
    const editor = hook.editor();
    let uploadCount = 0;

    assertEventsLength(0);
    const uploadDone = () => {
      assertEventsLength(0);
      assert.equal(uploadCount, 0, 'Should not upload.');
    };

    editor.setContent('<img src="' + testBlobDataUri + '" data-mce-bogus="1">');

    editor.options.set('images_upload_handler', (_data: BlobInfo) => {
      uploadCount++;
      return Promise.resolve('url');
    });

    return editor.uploadImages().then(uploadDone);
  });

  it(`TBA: Don't upload api filtered image`, () => {
    const editor = hook.editor();
    let uploadCount = 0, filterCount = 0;

    assertEventsLength(0);
    const uploadDone = () => {
      assertEventsLength(0);
      assert.equal(uploadCount, 0, 'Should not upload.');
      assert.equal(filterCount, 1, 'Should have filtered one item.');
    };

    editor.editorUpload.addFilter((img) => {
      filterCount++;
      return !img.hasAttribute('data-skip');
    });

    editor.setContent('<img src="' + testBlobDataUri + '" data-skip="1">');
    filterCount = 0;

    editor.options.set('images_upload_handler', (_data: BlobInfo) => {
      uploadCount++;
      return Promise.resolve('url');
    });

    return editor.uploadImages().then(uploadDone);
  });

  it('TBA: Retain blobs not in blob cache', () => {
    const editor = hook.editor();
    editor.setContent('<img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6">');
    assert.equal(editor.getContent(), '<p><img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6"></p>', 'Retain blobs not in blob cache');
  });

  it('TINY-7735: UploadResult should contain the removed flag if the {remove: true} option was passed to the failure callback', () => {
    const editor = hook.editor();
    let uploadCount = 0;

    const uploadDone = (result: UploadResult[]) => {

      assert.isTrue(result[0].status, 'first image upload is successful');
      assert.isFalse(result[0].removed, 'removed flag is false');
      assert.isFalse(result[1].status, 'second image upload is failed');
      assert.isFalse(result[1].removed, 'removed flag is false');
      assert.isFalse(result[2].status, 'third image upload is failed');
      assert.isTrue(result[2].removed, 'removed flag is true');
    };

    const imgHtml1 = imageHtml(randBlobDataUri(10, 10));
    const imgHtml2 = imageHtml(randBlobDataUri(10, 10));
    const imgHtml3 = imageHtml(randBlobDataUri(10, 10));

    setInitialContent(editor, imgHtml1 + imgHtml2 + imgHtml3);

    editor.options.set('images_upload_handler', (_data: BlobInfo) => {
      uploadCount++;

      return new Promise((resolve, reject) => {
        if (uploadCount === 1) {
          setTimeout(() => {
            resolve('file.png');
          }, 0);
        } else if (uploadCount === 2) {
          setTimeout(() => {
            reject('Error');
          }, 0);
        } else if (uploadCount === 3) {
          setTimeout(() => {
            reject({ message: 'Error', remove: true });
          }, 0);
        }
      });
    });

    return editor.uploadImages().then(uploadDone);
  });

  it('TINY-8337: Images with a data URI that does not use base64 encoding are uploaded correctly and not corrupted', () => {
    const editor = hook.editor();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' height='100' width='100'><circle cx='50' cy='50' r='40' stroke='black' stroke-width='3' fill='red'></svg>`;
    let uploadedBlobInfo: BlobInfo, uploadUri: string;

    setInitialContent(editor, imageHtml('data:image/svg+xml,' + encodeURIComponent(svg)));

    editor.options.set('images_upload_handler', (data: BlobInfo) => {
      uploadedBlobInfo = data;
      uploadUri = data.id() + '.svg';
      return Promise.resolve(uploadUri);
    });

    assertEventsLength(0);
    return editor.uploadImages().then((firstResult) => {
      assert.equal(uploadedBlobInfo.base64(), btoa(svg), 'base64 data is correctly encoded');
      assert.isAbove(uploadedBlobInfo.blob().size, 100, 'Blob data should not be empty');
      assertResult(editor, 'Upload the images', uploadUri, uploadedBlobInfo, firstResult, '.svg');
      assertEventsLength(1);
      return editor.uploadImages().then((secondResult) => {
        assert.lengthOf(secondResult, 0, 'Upload the images');
      });
    });
  });

  it('TINY-8337: Images with a data URI that are not base64 encoded are not processed if filtered out', () => {
    const editor = hook.editor();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" height="100" width="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="blue"></svg>`;
    const dataUri = 'data:image/svg+xml,' + encodeURIComponent(svg);

    editor.editorUpload.addFilter((img) => img.src !== dataUri);

    setInitialContent(editor, imageHtml(dataUri));

    editor.options.set('images_upload_handler', () => {
      return Promise.reject('Should not be called');
    });

    assertEventsLength(0);
    return editor.uploadImages().then(() => {
      assertEventsLength(0);
      TinyAssertions.assertContent(editor, `<p><img src="${dataUri}"></p>`);
    });
  });
});
