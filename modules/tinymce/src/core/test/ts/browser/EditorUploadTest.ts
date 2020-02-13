import { Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { UploadResult } from 'tinymce/core/api/EditorUpload';
import Env from 'tinymce/core/api/Env';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import Delay from 'tinymce/core/api/util/Delay';
import Conversions from 'tinymce/core/file/Conversions';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorUploadTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  let testBlobDataUri;

  if (!Env.fileApi) {
    return;
  }

  const teardown = function (editor: Editor) {
    return Step.sync(function () {
      editor.editorUpload.destroy();
      editor.settings.automatic_uploads = false;
      delete editor.settings.images_replace_blob_uris;
      delete editor.settings.images_dataimg_filter;
    });
  };

  const appendTeardown = function (editor: Editor, steps: Step<any, any>[]) {
    return Arr.bind(steps, function (step) {
      return [step, teardown(editor)];
    });
  };

  const imageHtml = function (uri: string) {
    return DOMUtils.DOM.createHTML('img', { src: uri });
  };

  const assertResult = function (editor: Editor, uploadedBlobInfo: BlobInfo, result: UploadResult[]) {
    LegacyUnit.strictEqual(result.length, 1);
    LegacyUnit.strictEqual(result[0].status, true);
    LegacyUnit.strictEqual(result[0].element.src.indexOf(uploadedBlobInfo.id() + '.png') !== -1, true);
    LegacyUnit.equal('<p><img src="' + uploadedBlobInfo.filename() + '" /></p>', editor.getContent());

    return result;
  };

  const hasBlobAsSource = function (elm) {
    return elm.src.indexOf('blob:') === 0;
  };

  suite.asyncTest('_scanForImages', function (editor, done, fail) {
    editor.setContent(imageHtml(testBlobDataUri));

    editor._scanForImages().then(function (result) {
      const blobInfo = result[0].blobInfo;

      LegacyUnit.equal('data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64(), testBlobDataUri);
      LegacyUnit.equal(editor.getBody().innerHTML, '<p><img src="' + blobInfo.blobUri() + '"></p>');
      LegacyUnit.equal(
        '<p><img src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '" /></p>',
        editor.getContent()
      );
      LegacyUnit.strictEqual(editor.editorUpload.blobCache.get(blobInfo.id()), blobInfo);
    }).then(done).catch(fail);
  });

  suite.asyncTest('replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)', function (editor, done) {
    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = function (data, success) {
      success('file.png');
    };

    editor._scanForImages().then(function (result) {
      const blobUri = result[0].blobInfo.blobUri();

      editor.uploadImages(function () {
        editor.setContent(imageHtml(blobUri));
        LegacyUnit.strictEqual(hasBlobAsSource(editor.$('img')[0]), false);
        LegacyUnit.strictEqual(editor.getContent(), '<p><img src="file.png" /></p>');
        done();
      });
    });
  });

  suite.asyncTest(
  'don\'t replace uploaded blob uri with result uri (copy/paste of' +
  ' an uploaded blob uri) since blob uris are retained',
  function (editor, done) {
    editor.settings.images_replace_blob_uris = false;
    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = function (data, success) {
      success('file.png');
    };

    editor._scanForImages().then(function (result) {
      const blobUri = result[0].blobInfo.blobUri();

      editor.uploadImages(function () {
        editor.setContent(imageHtml(blobUri));
        LegacyUnit.strictEqual(hasBlobAsSource(editor.$('img')[0]), true);
        LegacyUnit.strictEqual(editor.getContent(), '<p><img src="file.png" /></p>');
        done();
      });
    });
  });

  suite.asyncTest('uploadImages (callback)', function (editor, done) {
    let uploadedBlobInfo;

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = function (data, success) {
      uploadedBlobInfo = data;
      success(data.id() + '.png');
    };

    editor.uploadImages(function (result) {
      assertResult(editor, uploadedBlobInfo, result);

      editor.uploadImages(function (result) {
        LegacyUnit.strictEqual(result.length, 0);
        done();
      });
    });
  });

  suite.asyncTest('uploadImages (promise)', function (editor, done) {
    let uploadedBlobInfo;

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = function (data, success) {
      uploadedBlobInfo = data;
      success(data.id() + '.png');
    };

    editor.uploadImages().then(function (result) {
      assertResult(editor, uploadedBlobInfo, result);
    }).then(function () {
      uploadedBlobInfo = null;

      return editor.uploadImages().then(function (result) {
        LegacyUnit.strictEqual(result.length, 0);
        LegacyUnit.strictEqual(uploadedBlobInfo, null);
        done();
      });
    });
  });

  suite.asyncTest('uploadImages retain blob urls after upload', function (editor, done) {
    let uploadedBlobInfo;

    const assertResult = function (result) {
      LegacyUnit.strictEqual(result[0].status, true);
      LegacyUnit.strictEqual(hasBlobAsSource(result[0].element), true, 'Not a blob url');
      LegacyUnit.equal('<p><img src="' + uploadedBlobInfo.filename() + '" /></p>', editor.getContent());

      return result;
    };

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_replace_blob_uris = false;
    editor.settings.images_upload_handler = function (data, success) {
      uploadedBlobInfo = data;
      success(data.id() + '.png');
    };

    editor.uploadImages(assertResult).then(assertResult).then(function () {
      uploadedBlobInfo = null;

      return editor.uploadImages(function () {}).then(function (result) {
        LegacyUnit.strictEqual(result.length, 0);
        LegacyUnit.strictEqual(uploadedBlobInfo, null);
      });
    }).then(done);
  });

  suite.asyncTest('uploadImages reuse filename', (editor, done, die) => {
    let uploadedBlobInfo;

    editor.settings.images_reuse_filename = true;
    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = (data: BlobInfo, success) => {
      uploadedBlobInfo = data;
      success('custom.png?size=small');
    };

    const assertResult = function (editor: Editor, uploadedBlobInfo: BlobInfo, result: UploadResult[]) {
      LegacyUnit.strictEqual(result.length, 1);
      LegacyUnit.strictEqual(result[0].status, true);
      LegacyUnit.equal('<p><img src="custom.png?size=small" /></p>', editor.getContent());

      return result;
    };

    editor.uploadImages((result) => {
      assertResult(editor, uploadedBlobInfo, result);

      return editor.uploadImages((result) => {
        const img = editor.$('img')[0];
        LegacyUnit.strictEqual(hasBlobAsSource(img), false);
        LegacyUnit.strictEqual(img.src.indexOf('custom.png?size=small&') !== -1, true, 'Check the cache invalidation string was added');
        LegacyUnit.strictEqual(editor.getContent(), '<p><img src="custom.png?size=small" /></p>');
        delete editor.settings.images_reuse_filename;
        done();
      });
    });
  });

  suite.asyncTest('uploadConcurrentImages', function (editor, done) {
    let uploadCount = 0, callCount = 0;

    const uploadDone = function (result) {
      callCount++;

      if (callCount === 2) {
        done();
        LegacyUnit.equal(uploadCount, 1, 'Should only be one upload.');
      }

      LegacyUnit.equal(editor.getContent(), '<p><img src="myimage.png" /></p>');
      LegacyUnit.equalDom(result[0].element, editor.$('img')[0]);
      LegacyUnit.equal(result[0].status, true);
    };

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = function (data, success) {
      uploadCount++;

      Delay.setTimeout(function () {
        success('myimage.png');
      }, 0);
    };

    editor.uploadImages(uploadDone);
    editor.uploadImages(uploadDone);
  });

  suite.asyncTest('uploadConcurrentImages (fail)', function (editor, done) {
    let uploadCount = 0, callCount = 0;

    const uploadDone = function (result) {
      callCount++;

      if (callCount === 2) {
        done();
        // This is in exact since the status of the image can be pending or failed meaing it should try again
        LegacyUnit.equal(uploadCount >= 1, true, 'Should at least be one.');
      }

      LegacyUnit.equalDom(result[0].element, editor.$('img')[0]);
      LegacyUnit.equal(result[0].status, false);
    };

    editor.setContent(imageHtml(testBlobDataUri));

    editor.settings.images_upload_handler = function (data, success, failure) {
      uploadCount++;

      Delay.setTimeout(function () {
        failure('Error');
      }, 0);
    };

    editor.uploadImages(uploadDone);
    editor.uploadImages(uploadDone);
  });

  suite.asyncTest('Don\'t upload transparent image', function (editor, done) {
    let uploadCount = 0;

    const uploadDone = function () {
      done();
      LegacyUnit.equal(uploadCount, 0, 'Should not upload.');
    };

    editor.setContent(imageHtml(Env.transparentSrc));

    editor.settings.images_upload_handler = function (data, success) {
      uploadCount++;
      success('url');
    };

    editor.uploadImages(uploadDone);
  });

  suite.asyncTest('Don\'t upload bogus image', function (editor, done) {
    let uploadCount = 0;

    const uploadDone = function () {
      done();
      LegacyUnit.equal(uploadCount, 0, 'Should not upload.');
    };

    editor.getBody().innerHTML = '<img src="' + testBlobDataUri + '" data-mce-bogus="1">';

    editor.settings.images_upload_handler = function (data, success) {
      uploadCount++;
      success('url');
    };

    editor.uploadImages(uploadDone);
  });

  suite.asyncTest('Don\'t upload filtered image', function (editor, done) {
    let uploadCount = 0;

    const uploadDone = function () {
      done();
      LegacyUnit.equal(uploadCount, 0, 'Should not upload.');
    };

    editor.getBody().innerHTML = (
      '<img src="' + testBlobDataUri + '" data-skip="1">'
    );

    editor.settings.images_dataimg_filter = function (img) {
      return !img.hasAttribute('data-skip');
    };

    editor.settings.images_upload_handler = function (data, success) {
      uploadCount++;
      success('url');
    };

    editor.uploadImages(uploadDone);
  });

  suite.asyncTest('Don\'t upload api filtered image', function (editor, done) {
    let uploadCount = 0, filterCount = 0;

    const uploadDone = function () {
      LegacyUnit.equal(uploadCount, 0, 'Should not upload.');
      LegacyUnit.equal(filterCount, 1, 'Should have filtered one item.');
      done();
    };

    editor.getBody().innerHTML = (
      '<img src="' + testBlobDataUri + '" data-skip="1">'
    );

    editor.settings.images_dataimg_filter = Fun.constant(true);
    editor.editorUpload.addFilter((img) => {
      filterCount++;
      return !img.hasAttribute('data-skip');
    });

    editor.settings.images_upload_handler = function (data, success) {
      uploadCount++;
      success('url');
    };

    editor.uploadImages(uploadDone);
  });

  suite.test('Retain blobs not in blob cache', function (editor) {
    editor.getBody().innerHTML = '<img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6">';
    LegacyUnit.equal('<p><img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6" /></p>', editor.getContent());
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    let canvas, context;

    canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 200;

    context = canvas.getContext('2d');
    context.fillStyle = '#ff0000';
    context.fillRect(0, 0, 160, 100);
    context.fillStyle = '#00ff00';
    context.fillRect(160, 0, 160, 100);
    context.fillStyle = '#0000ff';
    context.fillRect(0, 100, 160, 100);
    context.fillStyle = '#ff00ff';
    context.fillRect(160, 100, 160, 100);

    testBlobDataUri = canvas.toDataURL();

    Conversions.uriToBlob(testBlobDataUri).then(function () {
      const steps = appendTeardown(editor, suite.toSteps(editor));
      Pipeline.async({}, steps, onSuccess, onFailure);
    });
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    automatic_uploads: false,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
