import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as KeepHtmlComments from 'tinymce/core/html/KeepHtmlComments';

describe('atomic.tinymce.core.html.KeepHtmlComments', () => {
  it('TINY-12220: encodeData/decodeData', () => {
    assert.equal(KeepHtmlComments.encodeData('<>&'), '&lt;&gt;&amp;', 'Encoding data with special characters');
    assert.equal(KeepHtmlComments.encodeData('<>&&amp;&lt;&gt;'), '&lt;&gt;&amp;&amp;amp;&amp;lt;&amp;gt;', 'Encoding data existing encoding');
    assert.equal(KeepHtmlComments.encodeData('<>&abc<>&'), '&lt;&gt;&amp;abc&lt;&gt;&amp;', 'Encoding data with mixed content');

    assert.equal(KeepHtmlComments.decodeData('&lt;&gt;&amp;'), '<>&', 'Decoding data with special characters');
    assert.equal(KeepHtmlComments.decodeData('&lt;&gt;&amp;abc&lt;&gt;&amp;'), '<>&abc<>&', 'Decoding data with mixed content');
    assert.equal(KeepHtmlComments.decodeData(KeepHtmlComments.decodeData('<>&abc<>&')), '<>&abc<>&', 'Decoding should decode encoded data');
  });

  it('TINY-12220: property test encodeData/decodeData', () => {
    fc.assert(fc.property(
      fc.string(),
      (text) => {
        const decoded = KeepHtmlComments.decodeData(KeepHtmlComments.encodeData(text));
        assert.equal(decoded, text, `Decoding should always return original text for "${text}"`);
      }
    ));
  });
});

