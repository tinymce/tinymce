import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Redistribution from 'ephox/snooker/resize/Redistribution';
import { Size } from 'ephox/snooker/resize/Size';

UnitTest.test('RedistributeTest', () => {
  const toStr = (f: Size) => {
    return f.fold((raw) => {
      return 'invalid[' + raw + ']';
    }, (pixels) => {
      return 'pixels[' + pixels + ']';
    }, (percent) => {
      return 'percent[' + percent + ']';
    });
  };

  const check = (expected: string[], input: string[], originalWidth: number, newWidth: string) => {
    Assert.eq('', expected, Redistribution.redistribute(input, originalWidth, newWidth));
  };

  const checkValidate = (expected: string, input: string) => {
    const actual = toStr(Redistribution.validate(input));
    Assert.eq('', expected, actual);
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

  Assert.eq('', [ '10px', '10px', '11px' ], Redistribution.normalize([ '10.3px', '10.3px', '10.3px' ]));
  Assert.eq('', [ '10px', '11px', '10px' ], Redistribution.normalize([ '10px', '11px', '10px' ]));
  Assert.eq('', [ '33.33%', '33.33%', '33.33%' ], Redistribution.normalize([ '33.33%', '33.33%', '33.33%' ]));

  Assert.eq('', 100, Redistribution.sum([ '100px' ], 10));
  Assert.eq('', 50, Redistribution.sum([ '50%' ], 10));
  Assert.eq('', 75, Redistribution.sum([ '50px', '25px' ], 10));
});
