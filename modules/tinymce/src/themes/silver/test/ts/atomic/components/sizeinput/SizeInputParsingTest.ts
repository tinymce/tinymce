import { UnitTest, assert } from '@ephox/bedrock-client';
import { Result, Arr } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

import { parseSize, Size, nuSize, SizeUnit } from 'tinymce/themes/silver/ui/sizeinput/SizeInputModel';
import { units, largeSensible } from './SizeInputShared';

UnitTest.test('SizeInputParsingTest', () => {
  const check = (expected: Result<Size, string>, text: string) => {
    const result = parseSize(text);
    expected.fold((err) => {
      result.fold((resultErr) => {
        assert.eq(err, resultErr);
      }, (resultValue) => {
        assert.fail('parseSize should have failed but succeeded with value:\n' + JSON.stringify(resultValue));
      });
    }, (value: Size) => {
      result.fold((resultErr) => {
        assert.fail('parseSize should have succeeded but failed with err: "' + resultErr + '"');
      }, (resultValue) => {
        assert.eq(value, resultValue);
      });
    });
  };

  check(Result.error(''), '');
  check(Result.error('px'), 'px');
  check(Result.error('a'), 'a');
  check(Result.error('blah'), 'blah');
  check(Result.error('1a'), '1a');
  // check negative numbers are not allowed
  check(Result.error('-1px'), '-1px');
  // check the empty unit
  check(Result.value(nuSize(1, '')), '1');
  // check various forms of padding
  check(Result.value(nuSize(1, 'px')), '1px');
  check(Result.value(nuSize(1, 'px')), '    1px');
  check(Result.value(nuSize(1, 'px')), '1px     ');
  check(Result.value(nuSize(1, 'px')), '    1px     ');
  check(Result.value(nuSize(1, 'px')), '    1    px     ');
  check(Result.value(nuSize(1.25, 'px')), '    1.25    px     ');
  // check that all units work
  Arr.each(units, (unit) => {
    check(Result.error(unit), unit);
    check(Result.value(nuSize(4, unit as SizeUnit)), '4' + unit);
  });

  const arbPad = Jsc.array(Jsc.elements(' \t'.split(''))).smap(
    function (arr) { return arr.join(''); },
    function (s) { return s.split(''); }
  );

  Jsc.property(
    'Valid size strings should be parseable',
    arbPad, Jsc.number(0, largeSensible), arbPad, Jsc.oneof(Jsc.elements(units)), arbPad,
    function (pad1: string, nonNegNumber: number, pad2: string, unit: SizeUnit, pad3: string) {
      const str = pad1 + nonNegNumber + pad2 + unit + pad3;
      const parsed = parseSize(str);
      const size = parsed.toOption().getOrNull();
      return Jsc.eq(nuSize(nonNegNumber, unit), size);
    }
  );
});
