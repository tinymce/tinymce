import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import * as Conversions from 'tinymce/core/file/Conversions';
import Env from 'tinymce/core/api/Env';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.file.ConversionsTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();
  const invalidBlobUriSrc = 'blob:70BE8432-BA4D-4787-9AB9-86563351FBF7';

  if (!Env.fileApi) {
    suite.test('File API not supported by browser.', function () {
      LegacyUnit.equal(true, true);
    });

    return;
  }

  suite.asyncTest('uriToBlob', function (world, done) {
    Conversions.uriToBlob('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D').then(Conversions.blobToDataUri).then(function (dataUri) {
      LegacyUnit.equal(dataUri, 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
    }).then(done);
  });

  suite.asyncTest('uriToBlob', function (world, done) {
    Conversions.uriToBlob(invalidBlobUriSrc).then(function () {
      LegacyUnit.equal(true, false, 'Conversion should fail.');
      done();
    }).catch(function (error) {
      LegacyUnit.equal(typeof error, 'string');
      LegacyUnit.equal(error.indexOf(invalidBlobUriSrc) !== -1, true);
      done();
    });
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
