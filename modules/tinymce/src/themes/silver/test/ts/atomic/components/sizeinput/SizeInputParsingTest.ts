import { describe, it } from '@ephox/bedrock-client';
import { Arr, Result } from '@ephox/katamari';
import { assert } from 'chai';
import * as fc from 'fast-check';

import { nuSize, parseSize, Size, SizeUnit } from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';

import { largeSensible, units } from './SizeInputShared';

describe('atomic.tinymce.themes.silver.components.sizeinput.SizeInputParsingTest', () => {
  const check = (expected: Result<Size, string>, text: string) => {
    const result = parseSize(text);
    expected.fold((err) => {
      result.fold((resultErr) => {
        assert.equal(resultErr, err);
      }, (resultValue) => {
        assert.fail('parseSize should have failed but succeeded with value:\n' + JSON.stringify(resultValue));
      });
    }, (value: Size) => {
      result.fold((resultErr) => {
        assert.fail('parseSize should have succeeded but failed with err: "' + resultErr + '"');
      }, (resultValue) => {
        assert.deepEqual(resultValue, value);
      });
    });
  };

  it('check invalid sizes do not parse', () => {
    check(Result.error(''), '');
    check(Result.error('px'), 'px');
    check(Result.error('a'), 'a');
    check(Result.error('blah'), 'blah');
    check(Result.error('1a'), '1a');
  });

  it('check negative numbers are not allowed', () => {
    check(Result.error('-1px'), '-1px');
  });

  it('check the empty unit', () => {
    check(Result.value(nuSize(1, '')), '1');
  });

  it('check various forms of padding', () => {
    check(Result.value(nuSize(1, 'px')), '1px');
    check(Result.value(nuSize(1, 'px')), '    1px');
    check(Result.value(nuSize(1, 'px')), '1px     ');
    check(Result.value(nuSize(1, 'px')), '    1px     ');
    check(Result.value(nuSize(1, 'px')), '    1    px     ');
    check(Result.value(nuSize(1.25, 'px')), '    1.25    px     ');
  });

  it('check that all units work', () => {
    Arr.each(units, (unit) => {
      check(Result.error(unit), unit);
      check(Result.value(nuSize(4, unit)), '4' + unit);
    });
  });

  it('Valid size strings should be parseable', () => {
    const arbPad = fc.array(fc.constantFrom(' ', '\t')).map((arr) => {
      return arr.join('');
    });

    fc.assert(fc.property(
      arbPad, fc.integer(0, largeSensible), arbPad, fc.constantFrom(...units), arbPad,
      (pad1: string, nonNegNumber: number, pad2: string, unit: SizeUnit, pad3: string) => {
        const str = pad1 + nonNegNumber + pad2 + unit + pad3;
        const parsed = parseSize(str);
        const size = parsed.toOptional().getOrNull();
        assert.deepEqual(size, nuSize(nonNegNumber, unit));
      }
    ));
  });
});
