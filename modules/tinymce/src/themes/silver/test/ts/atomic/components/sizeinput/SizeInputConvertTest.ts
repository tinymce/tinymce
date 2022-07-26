import { describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, Optionals } from '@ephox/katamari';
import { assert } from 'chai';
import * as fc from 'fast-check';

import { convertUnit, nuSize, Size, SizeUnit } from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';

import { convertibleUnits, largeSensible, units } from './SizeInputShared';

describe('atomic.tinymce.themes.silver.components.sizeinput.SizeInputConvertTest', () => {

  const check = (expected: Optional<number>, size: Size, unit: SizeUnit) => {
    const result = convertUnit(size, unit);
    assert.isTrue(Optionals.equals(expected, result),
      'Expected conversion of ' + JSON.stringify(size) +
      ' to ' + unit + ' = ' + result.toString()
    );
  };

  it('convert unit between different units', () => {
    check(Optional.some(12), nuSize(12, 'mm'), 'mm');
    check(Optional.some(16848), nuSize(234, 'in'), 'pt');
    check(Optional.some(75.59055118110236), nuSize(2, 'cm'), 'px');
    check(Optional.none(), nuSize(2, 'cm'), 'ch');
  });

  it('All units can convert to themselves', () => {
    fc.assert(fc.property(
      fc.integer(0, largeSensible), fc.constantFrom(...units),
      (value: number, unit: SizeUnit) => {
        const outValue = convertUnit(nuSize(value, unit), unit).getOrNull();
        assert.equal(outValue, value);
      }
    ));
  });

  it('All convertible units should convert back and forth', () => {
    fc.assert(fc.property(
      fc.integer(0, largeSensible), fc.constantFrom(...convertibleUnits), fc.constantFrom(...convertibleUnits),
      (value: number, unit1: SizeUnit, unit2: SizeUnit) => {
        const outValue = convertUnit(nuSize(value, unit1), unit2).bind(
          (unit2Value) => convertUnit(nuSize(unit2Value, unit2), unit1)
        ).getOrNull();
        assert.isNotNull(outValue);
        assert.approximately(outValue as number, value, 0.000001);
      }
    ));
  });

  it('All non-convertible units can only convert to themselves', () => {
    const nonConvertible = Arr.filter(units, (unit) => !Arr.contains(convertibleUnits, unit));
    fc.assert(fc.property(
      fc.integer(0, largeSensible), fc.constantFrom(...nonConvertible), fc.constantFrom(...units),
      (value: number, unit1: SizeUnit, unit2: SizeUnit) => {
        assert.equal(convertUnit(nuSize(value, unit1), unit2).isSome(), unit1 === unit2);
      }
    ));
  });
});
