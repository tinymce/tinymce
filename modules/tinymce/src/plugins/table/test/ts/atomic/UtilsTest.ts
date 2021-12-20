import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import { addPxSuffix, removePxSuffix } from 'tinymce/plugins/table/core/Utils';

describe('atomic.tinymce.plugins.table.core.UtilsTest', () => {
  it('removePxSuffix', () => {
    assert.equal(removePxSuffix(''), '', 'Empty string is identical');
    assert.equal(removePxSuffix('10px'), '10', 'Pixel string has pixel removed');

    fc.assert(fc.property(fc.float(1, 100), (n) => {
      assert.equal(removePxSuffix(n + 'px'), n + '', 'Arbitrary float with px string is true');
      assert.equal(removePxSuffix(n + ''), n + '', 'Number string is identical');
      assert.equal(removePxSuffix('px' + n), 'px' + n, 'String with pixel prefix is identical');
      assert.equal(removePxSuffix(n + '%'), n + '%', 'Percent string is identical');
    }));
  });

  it('addPxSuffix', () => {
    assert.equal(addPxSuffix(''), '', 'Empty string is identical');
    assert.equal(addPxSuffix('10'), '10px', 'Number string has px added');

    fc.assert(fc.property(fc.float(1, 100), (n) => {
      assert.equal(addPxSuffix(n + ''), n + 'px', 'Arbitrary float with px string is true');
      assert.equal(addPxSuffix(n + '%'), n + '%', 'Percent string is identical');
      assert.equal(addPxSuffix(n + 'px'), n + 'px', 'Pixel string is identical');
    }));
  });
});
