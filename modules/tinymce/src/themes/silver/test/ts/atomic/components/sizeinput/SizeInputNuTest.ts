import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { nuSize } from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';

describe('atomic.tinymce.themes.silver.components.sizeinput.SizeInputNuTest', () => {
  it('Create new Size object', () => {
    assert.deepEqual(nuSize(4, 'px'), { value: 4, unit: 'px' });
    assert.deepEqual(nuSize(234, ''), { value: 234, unit: '' });
    assert.deepEqual(nuSize(36, 'em'), { value: 36, unit: 'em' });
  });
});
