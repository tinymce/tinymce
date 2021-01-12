import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Data from 'tinymce/plugins/visualchars/core/Data';

describe('atomic.tinymce.plugins.visualchars.DataTest', () => {
  it('should return correct selector', () => {
    assert.equal('span.mce-a,span.mce-b', Data.charMapToSelector({ a: 'a', b: 'b' }));
  });

  it('should return correct regexp', () => {
    assert.equal('/[ab]/', Data.charMapToRegExp({ a: 'a', b: 'b' }).toString());
  });

  it('should return correct global regexp', () => {
    assert.equal('/[ab]/g', Data.charMapToRegExp({ a: 'a', b: 'b' }, true).toString());
  });
});
