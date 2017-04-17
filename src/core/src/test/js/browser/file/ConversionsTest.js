asynctest(
  'browser.tinymce.core.file.ConversionsTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.file.Conversions',
    'tinymce.core.Env'
  ],
  function (LegacyUnit, Pipeline, Conversions, Env) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var invalidBlobUriSrc = "blob:70BE8432-BA4D-4787-9AB9-86563351FBF7";

    if (!Env.fileApi) {
      suite.test("File API not supported by browser.", function () {
        LegacyUnit.equal(true, true);
      });

      return;
    }

    suite.asyncTest("uriToBlob", function (world, done) {
      Conversions.uriToBlob("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D").then(Conversions.blobToDataUri).then(function (dataUri) {
        LegacyUnit.equal(dataUri, "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==");
      }).then(done);
    });

    suite.asyncTest("uriToBlob", function (world, done) {
      Conversions.uriToBlob(invalidBlobUriSrc).then(function () {
        LegacyUnit.equal(true, false, "Conversion should fail.");
        done();
      })['catch'](function (error) {
        LegacyUnit.equal(typeof error, 'string');
        LegacyUnit.equal(error.indexOf(invalidBlobUriSrc) !== -1, true);
        done();
      });
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);