import { describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { processDataUri } from 'tinymce/core/file/BlobCacheUtils';

describe('atomic.tinymce.core.file.BlobCacheUtilsTest', () => {
  it('TINY-13938: processDataUri should not throw error with URIs with Byte Order Mark (BOM)', () => {
    assert.doesNotThrow(() => processDataUri('data:image/svg+xml,%EF%BB%BF%3Csvg', false, Fun.constant(Optional.none())));
  });
});
