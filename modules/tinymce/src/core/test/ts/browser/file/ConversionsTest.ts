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

  it('uriToBlob with invalid src', () => {
    return Conversions.uriToBlob(invalidBlobUriSrc).then(() => {
      assert.fail('Conversion should fail.');
    }, (error) => {
      assert.typeOf(error, 'object');
      assert.include(error.message, invalidBlobUriSrc);
    });
  });

  it('TINY-9548: should handle line feed carriage return characters in base64 data', async () => {
    const lfcrCharacters = '%0D%0A';
    const base64DataWithCrlf = `SGVsbG8sIFdvcmxkIQ${lfcrCharacters}==`;
    const blob = await Conversions.uriToBlob(`data:text/plain;base64,${base64DataWithCrlf}`);
    const dataUri = await Conversions.blobToDataUri(blob);
    assert.equal(dataUri, 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
  });

  it('TINY-9548: should handle space characters in base64 data', async () => {
    const spaceCharacters = '%20%20';
    const base64DataWithSpaces = `SGVsbG8sIFdvcmxkIQ${spaceCharacters}==`;
    const blob = await Conversions.uriToBlob(`data:text/plain;base64,${base64DataWithSpaces}`);
    const dataUri = await Conversions.blobToDataUri(blob);
    assert.equal(dataUri, 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
  });

  it('TINY-9548: should handle already decoded base64 data', async () => {
    const alreadyDecodedData = 'SGVsbG8sIFdvcmxkIQ==';
    const blob = await Conversions.uriToBlob(`data:text/plain;base64,${alreadyDecodedData}`);
    const dataUri = await Conversions.blobToDataUri(blob);
    assert.equal(dataUri, 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==');
  });
});
