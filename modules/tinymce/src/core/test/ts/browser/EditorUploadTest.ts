import { afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { UploadResult } from 'tinymce/core/api/EditorUpload';
import Env from 'tinymce/core/api/Env';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import Delay from 'tinymce/core/api/util/Delay';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Promise from 'tinymce/core/api/util/Promise';
import * as Conversions from 'tinymce/core/file/Conversions';
import Theme from 'tinymce/themes/silver/Theme';

const assertResult = (editor: Editor, title: string, uploadUri: string, uploadedBlobInfo: BlobInfo, result: UploadResult[]) => {
  const firstResult = result[0];
  assert.lengthOf(result, 1, title);
  assert.isTrue(firstResult.status, title);
  assert.include(firstResult.element.src, uploadedBlobInfo.id() + '.png', title);
  assert.equal(uploadUri, firstResult.uploadUri, title);
  assert.equal(uploadedBlobInfo.id(), firstResult.blobInfo.id(), title);
  assert.equal(uploadedBlobInfo.name(), firstResult.blobInfo.name(), title);
  assert.equal(uploadedBlobInfo.filename(), firstResult.blobInfo.filename(), title);
  assert.equal(uploadedBlobInfo.blob(), firstResult.blobInfo.blob(), title);
  assert.equal(uploadedBlobInfo.base64(), firstResult.blobInfo.base64(), title);
  assert.equal(uploadedBlobInfo.blobUri(), firstResult.blobInfo.blobUri(), title);
  assert.equal(uploadedBlobInfo.uri(), firstResult.blobInfo.uri(), title);
  assert.equal(editor.getContent(), '<p><img src="' + uploadedBlobInfo.filename() + '" /></p>', title);

  return result;
};

const hasBlobAsSource = (elm: HTMLImageElement) => elm.src.indexOf('blob:') === 0;
const imageHtml = (uri: string) => DOMUtils.DOM.createHTML('img', { src: uri });

describe('browser.tinymce.core.EditorUploadTest', () => {
  if (!Env.fileApi) {
    return;
  }

  let testBlobDataUri: string;
  let dataImgFilter: (img: HTMLImageElement) => boolean;
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

    const context = canvas.getContext('2d');
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
    images_dataimg_filter: (img) => dataImgFilter ? dataImgFilter(img) : true,
    setup: (ed: Editor) => ed.on('change', appendEvent)
  }, [ Theme ]);

  afterEach(() => {
    const editor = hook.editor();
    editor.editorUpload.destroy();
    editor.settings.automatic_uploads = false;
    delete editor.settings.images_replace_blob_uris;
    dataImgFilter = undefined;
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
        '<p><img src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '" /></p>',
        '_scanForImages'
      );
      assert.deepEqual(blobInfo, editor.editorUpload.blobCache.get(blobInfo.id()), '_scanForImages');
    });
  });

  it('TBA: replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)', () => {
    const editor = hook.editor();
    editor.settings.automatic_uploads = true;
    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      success('file.png');
    };

    setInitialContent(editor, imageHtml(testBlobDataUri));

    return editor._scanForImages().then((result) => {
      const blobUri = result[0].blobInfo.blobUri();

      assertEventsLength(0);
      return editor.uploadImages(() => {
        editor.setContent(imageHtml(blobUri));
        assert.isFalse(hasBlobAsSource(editor.$<HTMLImageElement>('img')[0]), 'replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)');
        assert.equal(editor.getContent(), '<p><img src="file.png" /></p>', 'replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)');
        assertEventsLength(1);
      });
    });
  });

  it(`TBA: don't replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri) since blob uris are retained`, () => {
    const editor = hook.editor();
    editor.settings.images_replace_blob_uris = false;
    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      success('file.png');
    };

    return editor._scanForImages().then((result) => {
      const blobUri = result[0].blobInfo.blobUri();

      assertEventsLength(0);
      return editor.uploadImages(() => {
        assertEventsLength(0);
        editor.setContent(imageHtml(blobUri));
        assert.isTrue(hasBlobAsSource(editor.$<HTMLImageElement>('img')[0]), 'Has blob');
        assert.equal(editor.getContent(), '<p><img src="file.png" /></p>', 'contains image');
      });
    });
  });

  it('TBA: uploadImages (callback)', () => {
    const editor = hook.editor();
    let uploadedBlobInfo, uploadUri;

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (data: BlobInfo, success) => {
      uploadedBlobInfo = data;
      uploadUri = data.id() + '.png';
      success(uploadUri);
    };

    assertEventsLength(0);
    return editor.uploadImages((result) => {
      assertResult(editor, 'Upload the images', uploadUri, uploadedBlobInfo, result);
      assertEventsLength(1);
    }).then(() => editor.uploadImages((result) => {
      assert.lengthOf(result, 0, 'Upload the images');
    }));
  });

  it('TBA: uploadImages (promise)', () => {
    const editor = hook.editor();
    let uploadedBlobInfo, uploadUri;

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (data: BlobInfo, success) => {
      uploadedBlobInfo = data;
      uploadUri = data.id() + '.png';
      success(uploadUri);
    };

    assertEventsLength(0);
    return editor.uploadImages().then((result) => {
      assertResult(editor, 'Upload the images', uploadUri, uploadedBlobInfo, result);
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
    let uploadedBlobInfo;

    const assertResultRetainsUrl = (result) => {
      assert.isTrue(result[0].status, 'uploadImages retain blob urls after upload');
      assert.isTrue(hasBlobAsSource(result[0].element), 'Not a blob url');
      assert.equal(editor.getContent(), '<p><img src="' + uploadedBlobInfo.filename() + '" /></p>', 'uploadImages retain blob urls after upload');

      return result;
    };

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.settings.images_replace_blob_uris = false;
    editor.settings.images_upload_handler = (data: BlobInfo, success) => {
      uploadedBlobInfo = data;
      success(data.id() + '.png');
    };

    assertEventsLength(0);
    return editor.uploadImages(assertResultRetainsUrl).then(assertResultRetainsUrl).then(() => {
      uploadedBlobInfo = null;
      assertEventsLength(0);

      return editor.uploadImages(Fun.noop).then((result) => {
        assert.lengthOf(result, 0, 'uploadImages retain blob urls after upload');
        assert.isNull(uploadedBlobInfo, 'uploadImages retain blob urls after upload');
      });
    });
  });

  it('TBA: uploadImages reuse filename', () => {
    const editor = hook.editor();
    let uploadedBlobInfo;

    editor.settings.images_reuse_filename = true;
    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (data: BlobInfo, success) => {
      uploadedBlobInfo = data;
      success('custom.png?size=small');
    };

    const assertResultReusesFilename = (editor: Editor, _uploadedBlobInfo: BlobInfo, result: UploadResult[]) => {
      assert.lengthOf(result, 1, 'uploadImages reuse filename');
      assert.isTrue(result[0].status, 'uploadImages reuse filename');
      assert.equal(editor.getContent(), '<p><img src="custom.png?size=small" /></p>', 'uploadImages reuse filename');

      return result;
    };

    assertEventsLength(0);
    return editor.uploadImages((result) => {
      assertResultReusesFilename(editor, uploadedBlobInfo, result);

      editor.uploadImages((_result) => {
        const img = editor.$<HTMLImageElement>('img')[0];
        assertEventsLength(1);
        assert.isFalse(hasBlobAsSource(img), 'uploadImages reuse filename');
        assert.include(img.src, 'custom.png?size=small&', 'Check the cache invalidation string was added');
        assert.equal(editor.getContent(), '<p><img src="custom.png?size=small" /></p>', 'uploadImages reuse filename');
        delete editor.settings.images_reuse_filename;
      });
    });
  });

  it('TBA: uploadConcurrentImages', () => {
    const editor = hook.editor();
    let uploadCount = 0, callCount = 0;

    const uploadDone = (result) => {
      callCount++;
      assertEventsLength(1);

      if (callCount === 2) {
        assert.equal(uploadCount, 1, 'Should only be one upload.');
      }

      assert.equal(editor.getContent(), '<p><img src="myimage.png" /></p>', 'uploadConcurrentImages');
      LegacyUnit.equalDom(result[0].element, editor.$('img')[0]);
      assert.isTrue(result[0].status, 'uploadConcurrentImages');
    };

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      uploadCount++;

      Delay.setTimeout(() => {
        success('myimage.png');
      }, 0);
    };

    assertEventsLength(0);
    return Promise.all([
      editor.uploadImages(uploadDone),
      editor.uploadImages(uploadDone)
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

      LegacyUnit.equalDom(result[0].element, editor.$<HTMLImageElement>('img')[0]);
      assert.isFalse(result[0].status, 'uploadConcurrentImages (fail)');
      assert.isEmpty(result[0].uploadUri, 'uploadConcurrentImages (fail)');
    };

    setInitialContent(editor, imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (_data: BlobInfo, _success, failure) => {
      uploadCount++;

      Delay.setTimeout(() => {
        failure('Error');
      }, 0);
    };

    assertEventsLength(0);
    return Promise.all([
      editor.uploadImages(uploadDone),
      editor.uploadImages(uploadDone)
    ]);
  });

  it('TINY-6011: uploadConcurrentImages fails, with remove', () => {
    const editor = hook.editor();
    let uploadCount = 0;
    let callCount = 0;

    const uploadDone = (result: UploadResult[]) => {
      callCount++;

      if (callCount === 2) {
        // Note: This is 2 as the removal of the image also triggers the addition of an undo level and a change event
        assertEventsLength(2);

        // This is in exact since the status of the image can be pending or failed meaning it should try again
        assert.isAtLeast(uploadCount, 1, 'Should at least be one.');
      }

      assert.isUndefined(editor.$('img')[0], 'No element in the editor');
      assert.isFalse(result[0].status, 'Status is false');
      assert.isEmpty(result[0].uploadUri, 'Uri is empty');
      assert.equal(editor.undoManager.data[0].content, '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-mce-placeholder="1"></p>', 'content is correct');
      assert.lengthOf(editor.undoManager.data, 2, 'Suitable number of stacks added');
    };

    editor.resetContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (_data: BlobInfo, _success, failure) => {
      uploadCount++;

      Delay.setTimeout(() => {
        failure('Error', { remove: true });
      }, 0);
    };

    assertEventsLength(0);
    return Promise.all([
      editor.uploadImages(uploadDone),
      editor.uploadImages(uploadDone)
    ]);
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

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      uploadCount++;
      success('url');
    };

    return editor.uploadImages(uploadDone);
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

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      uploadCount++;
      success('url');
    };

    return editor.uploadImages(uploadDone);
  });

  it(`TBA: Don't upload filtered image`, () => {
    const editor = hook.editor();
    let uploadCount = 0;

    assertEventsLength(0);
    const uploadDone = () => {
      assertEventsLength(0);
      assert.equal(uploadCount, 0, 'Should not upload.');
    };

    dataImgFilter = (img) => !img.hasAttribute('data-skip');

    editor.setContent('<img src="' + testBlobDataUri + '" data-skip="1">');

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      uploadCount++;
      success('url');
    };

    return editor.uploadImages(uploadDone);
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

    dataImgFilter = Fun.always;
    editor.editorUpload.addFilter((img) => {
      filterCount++;
      return !img.hasAttribute('data-skip');
    });

    editor.setContent('<img src="' + testBlobDataUri + '" data-skip="1">');
    filterCount = 0;

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      uploadCount++;
      success('url');
    };

    return editor.uploadImages(uploadDone);
  });

  it('TBA: Retain blobs not in blob cache', () => {
    const editor = hook.editor();
    editor.setContent('<img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6">');
    assert.equal(editor.getContent(), '<p><img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6" /></p>', 'Retain blobs not in blob cache');
  });
});
