import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import { addPxSuffix, isPercentage, isPixel, removePxSuffix } from 'tinymce/plugins/table/core/Util';

describe('atomic.tinymce.plugins.table.core.UtilTest', () => {
  it('isPercentage', () => {
    assert.isFalse(isPercentage(''), 'Empty string is false');
    assert.isFalse(isPercentage('%'), 'Single % string is false');
    assert.isTrue(isPercentage('10%'), 'Percentage string is true');
    assert.isTrue(isPercentage('10.125%'), 'Percentage with decimal string is true');

    fc.assert(fc.property(fc.float(1, 100), (n) => {
      assert.isTrue(isPercentage(n + '%'), 'Arbitrary float with percent string is true');
      assert.isFalse(isPercentage(n + ''), 'Number string is false');
      assert.isFalse(isPercentage(n + 'px'), 'Pixel string is false');
      assert.isFalse(isPercentage(n + '%' + n), 'String containing % string is false');
    }));
  });

  it('isPixel', () => {
    assert.isFalse(isPixel(''), 'Empty string is false');
    assert.isFalse(isPixel('px'), 'Single px string is false');
    assert.isTrue(isPixel('10px'), 'Pixel string is true');
    assert.isTrue(isPixel('10.125px'), 'Pixel with decimal string is true');

    fc.assert(fc.property(fc.float(1, 100), (n) => {
      assert.isTrue(isPixel(n + 'px'), 'Arbitrary float with px string is true');
      assert.isFalse(isPixel(n + ''), 'Number string is false');
      assert.isFalse(isPixel(n + '%'), 'Percent string is false');
      assert.isFalse(isPixel(n + 'px' + n), 'String containing px string is false');
    }));
  });

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
