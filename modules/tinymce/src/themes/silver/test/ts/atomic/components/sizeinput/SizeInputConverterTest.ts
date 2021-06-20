import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { assert } from 'chai';
import * as fc from 'fast-check';

import {
  makeRatioConverter, noSizeConversion, nuSize, ratioSizeConversion, Size, SizeConversion, SizeUnit
} from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';

import { largeSensible, units } from './SizeInputShared';

describe('atomic.tinymce.themes.silver.components.sizeinput.SizeInputConverterTest', () => {
  const check = (converter: SizeConversion) => (expected: Optional<Size>, input: Size) => {
    const result = converter(input);
    KAssert.eqOptional('eq', expected, result);
  };

  it('ratio size conversion (scale: 2)', () => {
    const checkRatio2 = check(ratioSizeConversion(2, 'in'));
    checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(0.5, 'in'));
    checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(48, 'px'));
    checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(6, 'pc'));
    checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(36, 'pt'));
    checkRatio2(Optional.some(nuSize(2, 'in')), nuSize(2.54, 'cm'));
    checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(12.7, 'mm'));
  });

  it('ratio size conversion (scale: 3)', () => {
    const checkRatio3 = check(ratioSizeConversion(3, 'in'));
    checkRatio3(Optional.some(nuSize(1, 'in')), nuSize(32, 'px'));
    checkRatio3(Optional.some(nuSize(1, 'in')), nuSize(4, 'pc'));
    checkRatio3(Optional.some(nuSize(1, 'in')), nuSize(24, 'pt'));
    checkRatio3(Optional.some(nuSize(3, 'in')), nuSize(2.54, 'cm'));
    checkRatio3(Optional.some(nuSize(3, 'in')), nuSize(25.4, 'mm'));
  });

  it('ratioSizeConversion is equivalent to multiplying when the units match', () => {
    fc.assert(fc.property(
      fc.nat(100), fc.nat(100), fc.constantFrom(...units),
      (scale: number, value: number, unit: SizeUnit) => {
        const v = ratioSizeConversion(scale, unit)({ value, unit }).getOrNull();
        assert.deepEqual(v, { value: scale * value, unit });
      }
    ));
  });

  it('noSizeConversion always returns none', () => {
    fc.assert(fc.property(
      fc.integer(0, largeSensible), fc.constantFrom(...units),
      (value: number, unit: SizeUnit) => {
        assert.isTrue(noSizeConversion({ value, unit }).isNone());
      }
    ));
  });

  it('make ratio converter (2in)', () => {
    const checkRatioConv2 = check(makeRatioConverter('96px', '2in'));
    checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(0.5, 'in'));
    checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(48, 'px'));
    checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(6, 'pc'));
    checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(36, 'pt'));
    checkRatioConv2(Optional.some(nuSize(2, 'in')), nuSize(2.54, 'cm'));
    checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(12.7, 'mm'));
  });

  it('make ratio converter (1em)', () => {
    const checkNoRatio = check(makeRatioConverter('96px', '1em'));
    checkNoRatio(Optional.none(), nuSize(1, 'em'));
    checkNoRatio(Optional.none(), nuSize(50, 'px'));
    checkNoRatio(Optional.none(), nuSize(2, 'cm'));
  });
});
