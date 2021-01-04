import { before, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Env from 'tinymce/core/api/Env';
import * as Conversions from 'tinymce/core/file/Conversions';

describe('browser.tinymce.core.file.ConversionsTest', () => {
  const invalidBlobUriSrc = 'blob:70BE8432-BA4D-4787-9AB9-86563351FBF7';

  before(function () {
    if (!Env.fileApi) {
      // eslint-disable-next-line no-console
      console.log('File API not supported by browser.');
      this.skip();
    }
  });

  it('uriToBlob', () => {
    return Conversions.uriToBlob('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D')
      .then(Conversions.blobToDataUri)
      .then((dataUri) => {
        assert.equal(dataUri, 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
      });
  });

  it('uriToBlob with invalid src', () => {
    return Conversions.uriToBlob(invalidBlobUriSrc).then(() => {
      assert.fail('Conversion should fail.');
    }, (error) => {
      assert.typeOf(error, 'string');
      assert.include(error, invalidBlobUriSrc);
    });
  });
});
