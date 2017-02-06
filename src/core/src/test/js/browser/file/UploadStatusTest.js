asynctest(
  'browser.tinymce.core.file.UploadStatusTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.file.UploadStatus'
  ],
  function (Pipeline, LegacyUnit, UploadStatus) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test('hasBlobUri/markPending', function () {
      var status = new UploadStatus();

      LegacyUnit.strictEqual(status.hasBlobUri("nonexisting_uri"), false);
      status.markPending("existing_uri");
      LegacyUnit.strictEqual(status.isPending("existing_uri"), true);
      LegacyUnit.strictEqual(status.isUploaded("existing_uri"), false);
      LegacyUnit.strictEqual(status.hasBlobUri("existing_uri"), true);

      status.markUploaded("existing_uri", "uri");
      LegacyUnit.strictEqual(status.isPending("existing_uri"), false);
      LegacyUnit.strictEqual(status.isUploaded("existing_uri"), true);
      LegacyUnit.strictEqual(status.hasBlobUri("existing_uri"), true);
      LegacyUnit.strictEqual(status.getResultUri("existing_uri"), "uri");

      status.markUploaded("existing_uri2", "uri2");
      LegacyUnit.strictEqual(status.isPending("existing_uri"), false);
      LegacyUnit.strictEqual(status.isUploaded("existing_uri"), true);
      LegacyUnit.strictEqual(status.hasBlobUri("existing_uri2"), true);
      LegacyUnit.strictEqual(status.getResultUri("existing_uri2"), "uri2");

      status.markPending("existing_uri");
      LegacyUnit.strictEqual(status.hasBlobUri("existing_uri"), true);
      status.removeFailed("existing_uri");
      LegacyUnit.strictEqual(status.hasBlobUri("existing_uri"), false);
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);