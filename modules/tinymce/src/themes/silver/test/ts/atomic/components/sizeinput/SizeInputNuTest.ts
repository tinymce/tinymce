import { UnitTest, assert } from '@ephox/bedrock-client';
import { nuSize } from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';

UnitTest.test('SizeInputNuTest', () => {
  assert.eq({ value: 4, unit: 'px' }, nuSize(4, 'px'));
  assert.eq({ value: 234, unit: '' }, nuSize(234, ''));
  assert.eq({ value: 36, unit: 'em' }, nuSize(36, 'em'));
});
