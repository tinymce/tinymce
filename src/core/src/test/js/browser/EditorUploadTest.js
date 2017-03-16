asynctest(
  'browser.tinymce.core.EditorUploadTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'global!document',
    'global!setTimeout',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.Env',
    'tinymce.core.file.Conversions',
    'tinymce.themes.modern.Theme'
  ],
  function (
    Pipeline, Step, Arr, LegacyUnit, TinyLoader, document, setTimeout, DOMUtils, Env, Conversions,
    Theme
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    var testBlobDataUri;

    if (!Env.fileApi) {
      return;
    }

    var teardown = function (editor) {
      return Step.sync(function () {
        editor.editorUpload.destroy();
        editor.settings.automatic_uploads = false;
        delete editor.settings.images_replace_blob_uris;
        delete editor.settings.images_dataimg_filter;
      });
    };

    var appendTeardown = function (editor, steps) {
      return Arr.bind(steps, function (step) {
        return [step, teardown(editor)];
      });
    };

    var imageHtml = function (uri) {
      return DOMUtils.DOM.createHTML('img', { src: uri });
    };

    var assertResult = function (editor, uploadedBlobInfo, result) {
      LegacyUnit.strictEqual(result.length, 1);
      LegacyUnit.strictEqual(result[0].status, true);
      LegacyUnit.strictEqual(result[0].element.src.indexOf(uploadedBlobInfo.id() + '.png') !== -1, true);
      LegacyUnit.equal('<p><img src="' + uploadedBlobInfo.filename() + '" /></p>', editor.getContent());

      return result;
    };

    var hasBlobAsSource = function (elm) {
      return elm.src.indexOf('blob:') === 0;
    };

    suite.asyncTest('_scanForImages', function (editor, done, fail) {
      editor.setContent(imageHtml(testBlobDataUri));

      editor._scanForImages().then(function (result) {
        var blobInfo = result[0].blobInfo;

        LegacyUnit.equal("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64(), testBlobDataUri);
        LegacyUnit.equal(editor.getBody().innerHTML, '<p><img src="' + blobInfo.blobUri() + '"></p>');
        LegacyUnit.equal(
          '<p><img src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '" /></p>',
          editor.getContent()
        );
        LegacyUnit.strictEqual(editor.editorUpload.blobCache.get(blobInfo.id()), blobInfo);
      }).then(done)["catch"](fail);
    });

    suite.asyncTest('replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)', function (editor, done) {
      editor.setContent(imageHtml(testBlobDataUri));

      editor.settings.images_upload_handler = function (data, success) {
        success('file.png');
      };

      editor._scanForImages().then(function (result) {
        var blobUri = result[0].blobInfo.blobUri();

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
        var blobUri = result[0].blobInfo.blobUri();

        editor.uploadImages(function () {
          editor.setContent(imageHtml(blobUri));
          LegacyUnit.strictEqual(hasBlobAsSource(editor.$('img')[0]), true);
          LegacyUnit.strictEqual(editor.getContent(), '<p><img src="file.png" /></p>');
          done();
        });
      });
    });

    suite.asyncTest('uploadImages (callback)', function (editor, done) {
      var uploadedBlobInfo;

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
      var uploadedBlobInfo;

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
      var uploadedBlobInfo;

      var assertResult = function (result) {
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

    suite.asyncTest('uploadConcurrentImages', function (editor, done) {
      var uploadCount = 0, callCount = 0;

      var uploadDone = function (result) {
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

        setTimeout(function () {
          success('myimage.png');
        }, 0);
      };

      editor.uploadImages(uploadDone);
      editor.uploadImages(uploadDone);
    });

    suite.asyncTest('uploadConcurrentImages (fail)', function (editor, done) {
      var uploadCount = 0, callCount = 0;

      var uploadDone = function (result) {
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

        setTimeout(function () {
          failure('Error');
        }, 0);
      };

      editor.uploadImages(uploadDone);
      editor.uploadImages(uploadDone);
    });

    suite.asyncTest('Don\'t upload transparent image', function (editor, done) {
      var uploadCount = 0;

      var uploadDone = function () {
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
      var uploadCount = 0;

      var uploadDone = function () {
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
      var uploadCount = 0;

      var uploadDone = function () {
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

    suite.test('Retain blobs not in blob cache', function (editor) {
      editor.getBody().innerHTML = '<img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6">';
      LegacyUnit.equal('<p><img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6" /></p>', editor.getContent());
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var canvas, context;

      canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 200;

      context = canvas.getContext("2d");
      context.fillStyle = "#ff0000";
      context.fillRect(0, 0, 160, 100);
      context.fillStyle = "#00ff00";
      context.fillRect(160, 0, 160, 100);
      context.fillStyle = "#0000ff";
      context.fillRect(0, 100, 160, 100);
      context.fillStyle = "#ff00ff";
      context.fillRect(160, 100, 160, 100);

      testBlobDataUri = canvas.toDataURL();

      Conversions.uriToBlob(testBlobDataUri).then(function () {
        var steps = appendTeardown(editor, suite.toSteps(editor));
        Pipeline.async({}, steps, onSuccess, onFailure);
      });
    }, {
      selector: "textarea",
      add_unload_trigger: false,
      disable_nodechange: true,
      automatic_uploads: false,
      entities: 'raw',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
