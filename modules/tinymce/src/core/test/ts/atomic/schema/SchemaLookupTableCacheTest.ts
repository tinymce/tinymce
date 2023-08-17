import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as SchemaLookupTableCache from 'tinymce/core/schema/SchemaLookupTableCache';

describe('atomic.tinymce.core.schema.SchemaLookupTableCacheTest', () => {
  it('Schema lookups should be cached', () => {
    const html5Ref1 = SchemaLookupTableCache.getLookupTable('html5');
    const html5Ref2 = SchemaLookupTableCache.getLookupTable('html5');

    assert.equal(html5Ref1, html5Ref2, 'Should be the same reference');
  });
});

