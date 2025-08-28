import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Bidi from 'tinymce/core/text/Bidi';

describe('atomic.tinymce.core.text.BidiTest', () => {
  it('hasStrongRtl', () => {
    assert.isTrue(Bidi.hasStrongRtl('\u05D4\u05E7\u05D3\u05E9'), 'Hebrew is strong rtl');
    assert.isFalse(Bidi.hasStrongRtl('abc'), 'Abc is not strong rtl');
    assert.isFalse(Bidi.hasStrongRtl('.'), 'Dots are neutral');
  });
});
