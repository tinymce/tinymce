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

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);