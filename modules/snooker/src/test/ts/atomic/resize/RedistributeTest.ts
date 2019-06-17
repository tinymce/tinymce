import Redistribution from 'ephox/snooker/resize/Redistribution';
import { UnitTest, assert } from '@ephox/bedrock';
import { Size } from '../../../../main/ts/ephox/snooker/resize/Size';

UnitTest.test('RedistributeTest', function () {
  const toStr = function (f: Size) {
    return f.fold(function (raw) {
      return 'invalid[' + raw + ']';
    }, function (pixels) {
      return 'pixels[' + pixels + ']';
    }, function (percent) {
      return 'percent[' + percent + ']';
    });
  };

  const check = function (expected: string[], input: string[], originalWidth: number, newWidth: string) {
    assert.eq(expected, Redistribution.redistribute(input, originalWidth, newWidth));
  };

  const checkValidate = function (expected: string, input: string) {
    const actual = toStr(Redistribution.validate(input));
    assert.eq(expected, actual);
  };

  checkValidate('pixels[10]', '10px');
  checkValidate('invalid[10pxe]', '10pxe');
  checkValidate('percent[10]', '10%');

  // Put more tests in when it becomes clear that I need them
  checkValidate('pixels[10.5]', '10.5px');

  check([ '50%', '50%' ], [ '10px', '10px' ], 20, '200%');

  check([ '50%', '50%' ], [ '10px', '50%' ], 20, '200%');

  check([ '20px', '20px' ], [ '10px', '50%' ], 20, '40px');

  check([ '33px', '33px', '34px' ], [ '33.33%', '33.33%', '33.33%' ], 100, '100px');

  check([ '66px', '22px', '12px' ], [ '66.66%', '22.22%', '11.11%' ], 100, '100px');

  check([ '20px', '', '20px' ], [ '20px', '', '20px' ], 60, '60px');
  check([ '', '', '20px' ], [ '', '', '20px' ], 60, '60px');
  check([ '', '', '' ], [ '', '', '' ], 60, '60px');

  assert.eq([ '10px', '10px', '11px' ], Redistribution.toIntegers([ '10.3px', '10.3px', '10.3px' ]));

  assert.eq(100, Redistribution.sum([ '100px' ], 10));
  assert.eq(50, Redistribution.sum([ '50%' ], 10));
  assert.eq(75, Redistribution.sum([ '50px', '25px' ], 10));
});
