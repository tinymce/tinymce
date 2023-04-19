import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Conversions from 'tinymce/core/file/Conversions';

describe('browser.tinymce.core.file.ConversionsTest', () => {
  const invalidBlobUriSrc = 'blob:70BE8432-BA4D-4787-9AB9-86563351FBF7';

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
      assert.typeOf(error, 'object');
      assert.include(error.message, invalidBlobUriSrc);
    });
  });
});
