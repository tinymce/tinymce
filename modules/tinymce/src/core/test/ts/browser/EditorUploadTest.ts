import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { UploadResult } from 'tinymce/core/api/EditorUpload';
import Env from 'tinymce/core/api/Env';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import Delay from 'tinymce/core/api/util/Delay';
import Promise from 'tinymce/core/api/util/Promise';
import * as Conversions from 'tinymce/core/file/Conversions';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorUploadTest', (success, failure) => {
  Theme();

  let testBlobDataUri;
  let dataImgFilter: (img: HTMLImageElement) => boolean;

  if (!Env.fileApi) {
    return;
  }

  const teardown = (editor: Editor) =>
    Step.sync(() => {
      editor.editorUpload.destroy();
      editor.settings.automatic_uploads = false;
      delete editor.settings.images_replace_blob_uris;
      dataImgFilter = undefined;
    });

  const appendTeardown = (editor: Editor, steps: Step<any, any>[]) =>
    Arr.bind(steps, (step) =>
      [ step, teardown(editor) ]
    );

  const imageHtml = (uri: string) =>
    DOMUtils.DOM.createHTML('img', { src: uri });

  const assertResult = (editor: Editor, title: string, uploadUri: string, uploadedBlobInfo: BlobInfo, result: UploadResult[]) => {
    const firstResult = result[0];
    Assert.eq(title, 1, result.length);
    Assert.eq(title, true, firstResult.status);
    Assert.eq(title, true, firstResult.element.src.indexOf(uploadedBlobInfo.id() + '.png') !== -1);
    Assert.eq(title, uploadUri, firstResult.uploadUri);
    Assert.eq(title, uploadedBlobInfo.id(), firstResult.blobInfo.id());
    Assert.eq(title, uploadedBlobInfo.name(), firstResult.blobInfo.name());
    Assert.eq(title, uploadedBlobInfo.filename(), firstResult.blobInfo.filename());
    Assert.eq(title, uploadedBlobInfo.blob(), firstResult.blobInfo.blob());
    Assert.eq(title, uploadedBlobInfo.base64(), firstResult.blobInfo.base64());
    Assert.eq(title, uploadedBlobInfo.blobUri(), firstResult.blobInfo.blobUri());
    Assert.eq(title, uploadedBlobInfo.uri(), firstResult.blobInfo.uri());
    Assert.eq(title, editor.getContent(), '<p><img src="' + uploadedBlobInfo.filename() + '" /></p>');

    return result;
  };

  const hasBlobAsSource = (elm) =>
    elm.src.indexOf('blob:') === 0;

  const sScanForImages = (editor: Editor) => Log.step('TBA', '_scanForImages', Step.async((done, die) => {
    editor.setContent(imageHtml(testBlobDataUri));

    editor._scanForImages().then((result) => {
      const blobInfo = result[0].blobInfo;

      Assert.eq('_scanForImages', testBlobDataUri, 'data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64());
      Assert.eq('_scanForImages', '<p><img src="' + blobInfo.blobUri() + '"></p>', editor.getBody().innerHTML);
      Assert.eq('_scanForImages',
        '<p><img src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '" /></p>',
        editor.getContent()
      );
      Assert.eq('_scanForImages', blobInfo, editor.editorUpload.blobCache.get(blobInfo.id()));
    }).then(done, die);
  }));

  const sReplaceUploadUri = (editor: Editor) => Log.step('TBA', 'replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)', Step.async((done, die) => {
    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      success('file.png');
    };

    editor._scanForImages().then((result) => {
      const blobUri = result[0].blobInfo.blobUri();

      return editor.uploadImages(() => {
        editor.setContent(imageHtml(blobUri));
        Assert.eq('replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)', false, hasBlobAsSource(editor.$('img')[0]));
        Assert.eq('replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)', '<p><img src="file.png" /></p>', editor.getContent());
      });
    }).then(done, die);
  }));

  const sNoReplaceUploadUri = (editor: Editor) => Log.step('TBA', `don't replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri) since blob uris are retained`, Step.async((done, die) => {
    editor.settings.images_replace_blob_uris = false;
    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      success('file.png');
    };

    editor._scanForImages().then((result) => {
      const blobUri = result[0].blobInfo.blobUri();

      return editor.uploadImages(() => {
        editor.setContent(imageHtml(blobUri));
        Assert.eq('Has blob', true, hasBlobAsSource(editor.$('img')[0]));
        Assert.eq('contains image', '<p><img src="file.png" /></p>', editor.getContent());
      });
    }).then(done, die);
  }));

  const sUploadImagesCallback = (editor: Editor) => Log.step('TBA', 'uploadImages (callback)', Step.async((done, die) => {
    let uploadedBlobInfo, uploadUri;

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (data: BlobInfo, success) => {
      uploadedBlobInfo = data;
      uploadUri = data.id() + '.png';
      success(uploadUri);
    };

    editor.uploadImages((result) => {
      assertResult(editor, 'Upload the images', uploadUri, uploadedBlobInfo, result);
    }).then(() => editor.uploadImages((result) => {
      Assert.eq('Upload the images', 0, result.length);
    })).then(done, die);
  }));

  const sUploadImagesPromise = (editor: Editor) => Log.step('TBA', 'uploadImages (promise)', Step.async((done, die) => {
    let uploadedBlobInfo, uploadUri;

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (data: BlobInfo, success) => {
      uploadedBlobInfo = data;
      uploadUri = data.id() + '.png';
      success(uploadUri);
    };

    editor.uploadImages().then((result) => {
      assertResult(editor, 'Upload the images', uploadUri, uploadedBlobInfo, result);
    }).then(() => {
      uploadedBlobInfo = null;

      return editor.uploadImages().then((result) => {
        Assert.eq('Upload the images', 0, result.length);
        Assert.eq('Upload the images', null, uploadedBlobInfo);
      });
    }).then(done, die);
  }));

  const sUploadImagesRetainUrl = (editor: Editor) => Log.step('TBA', 'uploadImages retain blob urls after upload', Step.async((done, die) => {
    let uploadedBlobInfo;

    const assertResultRetainsUrl = (result) => {
      Assert.eq('uploadImages retain blob urls after upload', true, result[0].status);
      Assert.eq('Not a blob url', hasBlobAsSource(result[0].element), true);
      Assert.eq('uploadImages retain blob urls after upload', editor.getContent(), '<p><img src="' + uploadedBlobInfo.filename() + '" /></p>');

      return result;
    };

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_replace_blob_uris = false;
    editor.settings.images_upload_handler = (data: BlobInfo, success) => {
      uploadedBlobInfo = data;
      success(data.id() + '.png');
    };

    editor.uploadImages(assertResultRetainsUrl).then(assertResultRetainsUrl).then(() => {
      uploadedBlobInfo = null;

      return editor.uploadImages(() => {}).then((result) => {
        Assert.eq('uploadImages retain blob urls after upload', 0, result.length);
        Assert.eq('uploadImages retain blob urls after upload', null, uploadedBlobInfo);
      });
    }).then(done, die);
  }));

  const sUploadImagesReuseFilename = (editor: Editor) => Log.step('TBA', 'uploadImages reuse filename', Step.async((done, die) => {
    let uploadedBlobInfo;

    editor.settings.images_reuse_filename = true;
    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (data: BlobInfo, success) => {
      uploadedBlobInfo = data;
      success('custom.png?size=small');
    };

    const assertResultReusesFilename = (editor: Editor, _uploadedBlobInfo: BlobInfo, result: UploadResult[]) => {
      Assert.eq('uploadImages reuse filename', 1, result.length);
      Assert.eq('uploadImages reuse filename', true, result[0].status);
      Assert.eq('uploadImages reuse filename', editor.getContent(), '<p><img src="custom.png?size=small" /></p>');

      return result;
    };

    editor.uploadImages((result) => {
      assertResultReusesFilename(editor, uploadedBlobInfo, result);

      editor.uploadImages((_result) => {
        const img = editor.$<HTMLImageElement>('img')[0];
        Assert.eq('uploadImages reuse filename', false, hasBlobAsSource(img));
        Assert.eq('Check the cache invalidation string was added', true, img.src.indexOf('custom.png?size=small&') !== -1);
        Assert.eq('uploadImages reuse filename', '<p><img src="custom.png?size=small" /></p>', editor.getContent());
        delete editor.settings.images_reuse_filename;
      }).then(done, die);
    });
  }));

  const sUploadConcurrentImages = (editor: Editor) => Log.step('TBA', 'uploadConcurrentImages', Step.async((done, die) => {
    let uploadCount = 0, callCount = 0;

    const uploadDone = (result) => {
      callCount++;

      if (callCount === 2) {
        Assert.eq('Should only be one upload.', 1, uploadCount);
      }

      Assert.eq('uploadConcurrentImages', '<p><img src="myimage.png" /></p>', editor.getContent());
      LegacyUnit.equalDom(result[0].element, editor.$('img')[0]);
      Assert.eq('uploadConcurrentImages', true, result[0].status);
    };

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      uploadCount++;

      Delay.setTimeout(() => {
        success('myimage.png');
      }, 0);
    };

    Promise.all([
      editor.uploadImages(uploadDone),
      editor.uploadImages(uploadDone)
    ]).then(done, die);
  }));

  const sUploadConcurrentImagesFail = (editor: Editor) => Log.step('TBA', 'uploadConcurrentImages (fail)', Step.async((done, die) => {
    let uploadCount = 0, callCount = 0;

    const uploadDone = (result: UploadResult[]) => {
      callCount++;

      if (callCount === 2) {
        // This is in exact since the status of the image can be pending or failed meaning it should try again
        Assert.eq('Should at least be one.', true, uploadCount >= 1);
      }

      LegacyUnit.equalDom(result[0].element, editor.$('img')[0]);
      Assert.eq('uploadConcurrentImages (fail)', false, result[0].status);
      Assert.eq('uploadConcurrentImages (fail)', '', result[0].uploadUri);
    };

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (_data: BlobInfo, _success, failure) => {
      uploadCount++;

      Delay.setTimeout(() => {
        failure('Error');
      }, 0);
    };

    Promise.all([
      editor.uploadImages(uploadDone),
      editor.uploadImages(uploadDone)
    ]).then(done, die);
  }));

  const sUploadConcurrentImagesFailWithRemove = (editor: Editor) => Log.step('TINY-6011', 'uploadConcurrentImages fails, with remove', Step.async((done, die) => {
    let uploadCount = 0;
    let callCount = 0;

    const uploadDone = (result: UploadResult[]) => {
      callCount++;

      if (callCount === 2) {
        // This is in exact since the status of the image can be pending or failed meaning it should try again
        Assert.eq('Should at least be one.', uploadCount >= 1, true);
      }

      Assert.eq('No element in the editor', undefined, editor.$('img')[0]);
      Assert.eq('Status is false', result[0].status, false);
      Assert.eq('Uri is empty', result[0].uploadUri, '');
      Assert.eq('content is correct', '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-mce-placeholder="1"></p>', editor.undoManager.data[0].content);
      Assert.eq('Suitable number of stacks added', 2, editor.undoManager.data.length);
    };

    editor.resetContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (_data: BlobInfo, _success, failure) => {
      uploadCount++;

      Delay.setTimeout(() => {
        failure('Error', { remove: true });
      }, 0);
    };

    Promise.all([
      editor.uploadImages(uploadDone),
      editor.uploadImages(uploadDone)
    ]).then(done, die);
  }));

  const sDoNotUploadTransparentImage = (editor: Editor) => Log.step('TBA', `Don't upload transparent image`, Step.async((done, die) => {
    let uploadCount = 0;

    const uploadDone = () => {
      Assert.eq('Should not upload.', 0, uploadCount);
    };

    editor.setContent(imageHtml(Env.transparentSrc));

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      uploadCount++;
      success('url');
    };

    editor.uploadImages(uploadDone).then(done, die);
  }));

  const sDoNotUploadBogusImage = (editor: Editor) => Log.step('TBA', `Don't upload bogus image`, Step.async((done, die) => {
    let uploadCount = 0;

    const uploadDone = () => {
      Assert.eq('Should not upload.', 0, uploadCount);
    };

    editor.setContent('<img src="' + testBlobDataUri + '" data-mce-bogus="1">');

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      uploadCount++;
      success('url');
    };

    editor.uploadImages(uploadDone).then(done, die);
  }));

  const sDoNotUploadFilteredImage = (editor: Editor) => Log.step('TBA', `Don't upload filtered image`, Step.async((done, die) => {
    let uploadCount = 0;

    const uploadDone = () => {
      Assert.eq('Should not upload.', 0, uploadCount);
    };

    dataImgFilter = (img) => !img.hasAttribute('data-skip');

    editor.setContent('<img src="' + testBlobDataUri + '" data-skip="1">');

    editor.settings.images_upload_handler = (_data: BlobInfo, success) => {
      uploadCount++;
      success('url');
    };

    editor.uploadImages(uploadDone).then(done, die);
  }));

  const sDoNotUploadApiFilteredImage = (editor: Editor) => Log.step('TBA', `Don't upload api filtered image`, Step.async((done, die) => {
    let uploadCount = 0, filterCount = 0;

    const uploadDone = () => {
      Assert.eq('Should not upload.', 0, uploadCount);
      Assert.eq('Should have filtered one item.', 1, filterCount);
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

    editor.uploadImages(uploadDone).then(done, die);
  }));

  const sRetainBlobsNotInCache = (editor: Editor) => Log.step('TBA', 'Retain blobs not in blob cache', Step.sync(() => {
    editor.setContent('<img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6">');
    Assert.eq('Retain blobs not in blob cache', editor.getContent(), '<p><img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6" /></p>');
  }));

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
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

    Conversions.uriToBlob(testBlobDataUri).then(() => {
      const steps = appendTeardown(editor, [
        sScanForImages(editor),
        sReplaceUploadUri(editor),
        sNoReplaceUploadUri(editor),
        sUploadImagesCallback(editor),
        sUploadImagesPromise(editor),
        sUploadImagesRetainUrl(editor),
        sUploadImagesReuseFilename(editor),
        sUploadConcurrentImages(editor),
        sUploadConcurrentImagesFail(editor),
        sDoNotUploadTransparentImage(editor),
        sDoNotUploadBogusImage(editor),
        sDoNotUploadFilteredImage(editor),
        sDoNotUploadApiFilteredImage(editor),
        sRetainBlobsNotInCache(editor),
        sUploadConcurrentImagesFailWithRemove(editor)
      ]);
      Pipeline.async({}, steps, onSuccess, onFailure);
    });
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    automatic_uploads: false,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    images_dataimg_filter: (img) => dataImgFilter ? dataImgFilter(img) : true
  }, success, failure);
});
