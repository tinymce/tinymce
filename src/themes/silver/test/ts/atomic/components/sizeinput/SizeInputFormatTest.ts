import { UnitTest, assert } from '@ephox/bedrock';
import { formatSize } from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';

UnitTest.test('SizeInputFormatTest', function () {
  // pixel measurements do not get decimals
  assert.eq('12px', formatSize({value: 12, unit: 'px'}));
  assert.eq('12px', formatSize({value: 12.123, unit: 'px'}));
  assert.eq('12', formatSize({value: 12.123, unit: ''}));
  assert.eq('100', formatSize({value: 100.1, unit: ''}));
  // percentages get up to 4 decimal places
  assert.eq('1.1234%', formatSize({value: 1.1234321, unit: '%'}));
  assert.eq('1.12%', formatSize({value: 1.12, unit: '%'}));
  assert.eq('3%', formatSize({value: 3, unit: '%'}));
});