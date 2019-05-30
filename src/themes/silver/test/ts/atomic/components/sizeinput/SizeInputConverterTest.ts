import { UnitTest, assert } from '@ephox/bedrock';
import { SizeConversion, Size, noSizeConversion, SizeUnit, ratioSizeConversion, nuSize, makeRatioConverter } from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';
import { Option } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';
import { largeSensible, units } from './SizeInputShared';

UnitTest.test('SizeInputConverterTest', () => {
  const check = (converter: SizeConversion) => (expected: Option<Size>, input: Size) => {
    const result = converter(input);
    expected.fold(() => {
      assert.eq(true, result.isNone(), 'Expected none');
    }, (size) => {
      result.fold(() => {
        assert.fail('Expected size');
      }, (resultSize) => {
        assert.eq(size, resultSize);
      });
    });
  };

  const checkRatio2 = check(ratioSizeConversion(2, 'in'));
  checkRatio2(Option.some(nuSize(1, 'in')), nuSize(0.5, 'in'));
  checkRatio2(Option.some(nuSize(1, 'in')), nuSize(48, 'px'));
  checkRatio2(Option.some(nuSize(1, 'in')), nuSize(6, 'pc'));
  checkRatio2(Option.some(nuSize(1, 'in')), nuSize(36, 'pt'));
  checkRatio2(Option.some(nuSize(2, 'in')), nuSize(2.54, 'cm'));
  checkRatio2(Option.some(nuSize(1, 'in')), nuSize(12.7, 'mm'));

  const checkRatio3 = check(ratioSizeConversion(3, 'in'));
  checkRatio3(Option.some(nuSize(1, 'in')), nuSize(32, 'px'));
  checkRatio3(Option.some(nuSize(1, 'in')), nuSize(4, 'pc'));
  checkRatio3(Option.some(nuSize(1, 'in')), nuSize(24, 'pt'));
  checkRatio3(Option.some(nuSize(3, 'in')), nuSize(2.54, 'cm'));
  checkRatio3(Option.some(nuSize(3, 'in')), nuSize(25.4, 'mm'));

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
  checkRatioConv2(Option.some(nuSize(1, 'in')), nuSize(0.5, 'in'));
  checkRatioConv2(Option.some(nuSize(1, 'in')), nuSize(48, 'px'));
  checkRatioConv2(Option.some(nuSize(1, 'in')), nuSize(6, 'pc'));
  checkRatioConv2(Option.some(nuSize(1, 'in')), nuSize(36, 'pt'));
  checkRatioConv2(Option.some(nuSize(2, 'in')), nuSize(2.54, 'cm'));
  checkRatioConv2(Option.some(nuSize(1, 'in')), nuSize(12.7, 'mm'));

  const checkNoRatio = check(makeRatioConverter('96px', '1em'));
  checkNoRatio(Option.none(), nuSize(1, 'em'));
  checkNoRatio(Option.none(), nuSize(50, 'px'));
  checkNoRatio(Option.none(), nuSize(2, 'cm'));
});