import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as ExtendingChar from 'tinymce/core/text/ExtendingChar';

describe('atomic.tinymce.core.text.ExtendingCharTest', () => {
  it('isExtendingChar', () => {
    assert.strictEqual(ExtendingChar.isExtendingChar('a'), false);
    assert.strictEqual(ExtendingChar.isExtendingChar('\u0301'), true);
  });
});
