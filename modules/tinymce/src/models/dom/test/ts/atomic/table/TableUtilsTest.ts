import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import { isPercentage, isPixel } from 'tinymce/models/dom/table/core/TableUtils';

describe('atomic.tinymce.models.dom.table.TableUtilsTest', () => {
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
});
