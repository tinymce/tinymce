import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { formatSize } from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';

describe('atomic.tinymce.themes.silver.components.sizeinput.SizeInputFormatTest', () => {
  it('pixel measurements do not get decimals', () => {
    assert.equal(formatSize({ value: 12, unit: 'px' }), '12px');
    assert.equal(formatSize({ value: 12.123, unit: 'px' }), '12px');
    assert.equal(formatSize({ value: 12.123, unit: '' }), '12');
    assert.equal(formatSize({ value: 100.1, unit: '' }), '100');
  });

  it('percentages get up to 4 decimal places', () => {
    assert.equal(formatSize({ value: 1.1234321, unit: '%' }), '1.1234%');
    assert.equal(formatSize({ value: 1.12, unit: '%' }), '1.12%');
    assert.equal(formatSize({ value: 3, unit: '%' }), '3%');
  });
});
