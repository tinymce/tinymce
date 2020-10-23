import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import Jsc from '@ephox/wrap-jsverify';
import {
  makeRatioConverter, noSizeConversion, nuSize, ratioSizeConversion, Size, SizeConversion, SizeUnit
} from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';
import { largeSensible, units } from './SizeInputShared';

UnitTest.test('SizeInputConverterTest', () => {
  const check = (converter: SizeConversion) => (expected: Optional<Size>, input: Size) => {
    const result = converter(input);
    KAssert.eqOptional('eq', expected, result);
  };

  const checkRatio2 = check(ratioSizeConversion(2, 'in'));
  checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(0.5, 'in'));
  checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(48, 'px'));
  checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(6, 'pc'));
  checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(36, 'pt'));
  checkRatio2(Optional.some(nuSize(2, 'in')), nuSize(2.54, 'cm'));
  checkRatio2(Optional.some(nuSize(1, 'in')), nuSize(12.7, 'mm'));

  const checkRatio3 = check(ratioSizeConversion(3, 'in'));
  checkRatio3(Optional.some(nuSize(1, 'in')), nuSize(32, 'px'));
  checkRatio3(Optional.some(nuSize(1, 'in')), nuSize(4, 'pc'));
  checkRatio3(Optional.some(nuSize(1, 'in')), nuSize(24, 'pt'));
  checkRatio3(Optional.some(nuSize(3, 'in')), nuSize(2.54, 'cm'));
  checkRatio3(Optional.some(nuSize(3, 'in')), nuSize(25.4, 'mm'));

  Jsc.property(
    'ratioSizeConversion is equalivent to multipling when the units match',
    Jsc.nat(100), Jsc.nat(100), Jsc.oneof(Jsc.elements(units)),
    function (scale: number, value: number, unit: SizeUnit) {
      const v = ratioSizeConversion(scale, unit)({ value, unit }).getOrNull();
      return Jsc.eq({ value: scale * value, unit }, v);
    }
  );

  Jsc.property(
    'noSizeConversion always returns none',
    Jsc.number(0, largeSensible), Jsc.oneof(Jsc.elements(units)),
    function (value: number, unit: SizeUnit) {
      return Jsc.eq(true, noSizeConversion({ value, unit }).isNone());
    }
  );

  const checkRatioConv2 = check(makeRatioConverter('96px', '2in'));
  checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(0.5, 'in'));
  checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(48, 'px'));
  checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(6, 'pc'));
  checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(36, 'pt'));
  checkRatioConv2(Optional.some(nuSize(2, 'in')), nuSize(2.54, 'cm'));
  checkRatioConv2(Optional.some(nuSize(1, 'in')), nuSize(12.7, 'mm'));

  const checkNoRatio = check(makeRatioConverter('96px', '1em'));
  checkNoRatio(Optional.none(), nuSize(1, 'em'));
  checkNoRatio(Optional.none(), nuSize(50, 'px'));
  checkNoRatio(Optional.none(), nuSize(2, 'cm'));
});
