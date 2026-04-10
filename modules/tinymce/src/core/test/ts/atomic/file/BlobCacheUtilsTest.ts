import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { processDataUri } from 'tinymce/core/file/BlobCacheUtils';

describe('atomic.tinymce.core.file.BlobCacheUtilsTest', () => {
  it('TINY-13938: processDataUri should not throw error with URIs with Byte Order Mark (BOM)', () => {
    let result = '';
    assert.doesNotThrow(() => processDataUri('data:image/svg+xml,%EF%BB%BF%3Csvg', false, (base64) => {
      result = base64;
      return Optional.none();
    }));
    assert.equal(result, '77u/PHN2Zw==');
  });

  it('TINY-13938: processDataUri should not throw error with URIs with not Latin1 characters', () => {
    let result = '';
    assert.doesNotThrow(() => processDataUri('data:image/svg+xml,%EF%BB%BF%3Csvg犬', false, (base64) => {
      result = base64;
      return Optional.none();
    }));
    assert.equal(result, '77u/PHN2Z+eKrA==', 'base64 should be correct');
  });
});
