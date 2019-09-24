import { UnitTest, assert } from '@ephox/bedrock';
import Jsc from '@ephox/wrap-jsverify';

import { convertUnit, nuSize, SizeUnit, Size } from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';
import { convertableUnits, largeSensible, units } from './SizeInputShared';
import { Option, Arr } from '@ephox/katamari';

UnitTest.test('SizeInputConvertTest', () => {

  const check = (expected: Option<number>, size: Size, unit: SizeUnit) => {
    const result = convertUnit(size, unit);
    assert.eq(
      true, expected.equals(result),
      'Expected conversion of ' + JSON.stringify(size) +
      ' to ' + unit + ' = ' + result.toString()
    );
  };

  check(Option.some(12), nuSize(12, 'mm'), 'mm');
  check(Option.some(16848), nuSize(234, 'in'), 'pt');
  check(Option.some(75.59055118110236), nuSize(2, 'cm'), 'px');
  check(Option.none(), nuSize(2, 'cm'), 'ch');

  Jsc.property(
    'All units can convert to themselves',
    Jsc.number(0, largeSensible), Jsc.oneof(Jsc.elements(units)),
    function (value: number, unit: SizeUnit) {
      const outValue = convertUnit(nuSize(value, unit), unit).getOrNull();
      return Jsc.eq(value, outValue);
    }
  );

  const approxEq = (value, outValue) => Math.abs(value - outValue) < 0.000001;
  Jsc.property(
    'All convertable units should convert back and forth',
    Jsc.number(0, largeSensible), Jsc.oneof(Jsc.elements(convertableUnits)), Jsc.oneof(Jsc.elements(convertableUnits)),
    function (value: number, unit1: SizeUnit, unit2: SizeUnit) {
      const outValue = convertUnit(nuSize(value, unit1), unit2).bind(
        (unit2Value) => convertUnit(nuSize(unit2Value, unit2), unit1)
      ).getOrNull();
      return outValue !== null && approxEq(value, outValue);
    }
  );

  const nonConvertable = Arr.filter(units, (unit) => !Arr.contains(convertableUnits, unit));
  Jsc.property(
    'All non-convertable units can only convert to themselves',
    Jsc.number(0, largeSensible), Jsc.oneof(Jsc.elements(nonConvertable)), Jsc.oneof(Jsc.elements(units)),
    function (value: number, unit1: SizeUnit, unit2: SizeUnit) {
      return Jsc.eq(unit1 === unit2, convertUnit(nuSize(value, unit1), unit2).isSome());
    }
  );
});
