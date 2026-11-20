import { Assert, describe, it } from '@ephox/bedrock-client';
import { Dialog } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';

describe('atomic.tinymce.themes.silver.components.sizeinput.SizeInputRatioSpecTest', () => {
  const create = (ratio: unknown) => Dialog.createSizeInput({ type: 'sizeinput', name: 'dimensions', ratio } as Dialog.SizeInputSpec);

  it('TINYMCE-9866: should accept a number or function ratio', () => {
    Assert.eq('A number ratio should be valid', true, create(1.5).isValue());
    Assert.eq('A function ratio should be valid', true, create(Fun.constant(1.5)).isValue());
    Assert.eq('Leaving out the ratio should be valid', true, create(undefined).isValue());
  });

  it('TINYMCE-9866: should reject a ratio that is not a number or function', () => {
    Assert.eq('A string ratio should be invalid', true, create('1.5').isError());
    Assert.eq('An object ratio should be invalid', true, create({ width: 2, height: 1 }).isError());
  });
});
