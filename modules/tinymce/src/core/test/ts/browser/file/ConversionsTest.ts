import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Conversions from 'tinymce/core/file/Conversions';

describe('browser.tinymce.core.file.ConversionsTest', () => {
  const invalidBlobUriSrc = 'blob:70BE8432-BA4D-4787-9AB9-86563351FBF7';

  it('uriToBlob', async () => {
    const blob = await Conversions.uriToBlob('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D');
    const dataUri = await Conversions.blobToDataUri(blob);
    assert.equal(dataUri, 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
  });

  it('uriToBlob with invalid src', async () => {
    try {
      await Conversions.uriToBlob(invalidBlobUriSrc);
      assert.fail('Conversion should fail.');
    } catch (error: any) {
      assert.typeOf(error, 'object');
      assert.include(error.message, invalidBlobUriSrc);
    }
  });
});
