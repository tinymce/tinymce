import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import UploadStatus from 'tinymce/core/file/UploadStatus';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.file.UploadStatusTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  suite.test('hasBlobUri/markPending', function () {
    const status = UploadStatus();

    LegacyUnit.strictEqual(status.hasBlobUri('nonexisting_uri'), false);
    status.markPending('existing_uri');
    LegacyUnit.strictEqual(status.isPending('existing_uri'), true);
    LegacyUnit.strictEqual(status.isUploaded('existing_uri'), false);
    LegacyUnit.strictEqual(status.hasBlobUri('existing_uri'), true);

    status.markUploaded('existing_uri', 'uri');
    LegacyUnit.strictEqual(status.isPending('existing_uri'), false);
    LegacyUnit.strictEqual(status.isUploaded('existing_uri'), true);
    LegacyUnit.strictEqual(status.hasBlobUri('existing_uri'), true);
    LegacyUnit.strictEqual(status.getResultUri('existing_uri'), 'uri');

    status.markUploaded('existing_uri2', 'uri2');
    LegacyUnit.strictEqual(status.isPending('existing_uri'), false);
    LegacyUnit.strictEqual(status.isUploaded('existing_uri'), true);
    LegacyUnit.strictEqual(status.hasBlobUri('existing_uri2'), true);
    LegacyUnit.strictEqual(status.getResultUri('existing_uri2'), 'uri2');

    status.markPending('existing_uri');
    LegacyUnit.strictEqual(status.hasBlobUri('existing_uri'), true);
    status.removeFailed('existing_uri');
    LegacyUnit.strictEqual(status.hasBlobUri('existing_uri'), false);
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
