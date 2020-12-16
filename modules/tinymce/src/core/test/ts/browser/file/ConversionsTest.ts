import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import * as Conversions from 'tinymce/core/file/Conversions';

UnitTest.asynctest('browser.tinymce.core.file.ConversionsTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const invalidBlobUriSrc = 'blob:70BE8432-BA4D-4787-9AB9-86563351FBF7';

  if (!Env.fileApi) {
    suite.test('File API not supported by browser.', () => {
      LegacyUnit.equal(true, true);
    });

    return;
  }

  suite.asyncTest('uriToBlob', (world, done) => {
    Conversions.uriToBlob('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D').then(Conversions.blobToDataUri).then((dataUri) => {
      LegacyUnit.equal(dataUri, 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
    }).then(done);
  });

  suite.asyncTest('uriToBlob', (world, done) => {
    Conversions.uriToBlob(invalidBlobUriSrc).then(() => {
      LegacyUnit.equal(true, false, 'Conversion should fail.');
      done();
    }).catch((error) => {
      LegacyUnit.equal(typeof error, 'string');
      LegacyUnit.equal(error.indexOf(invalidBlobUriSrc) !== -1, true);
      done();
    });
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
