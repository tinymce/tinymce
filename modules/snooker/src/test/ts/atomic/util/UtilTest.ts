import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as Util from 'ephox/snooker/util/Util';

UnitTest.test('UtilTest', () => {
  const eq = (a: number, b: number) => a === b;

  Assert.eq('', [], Util.unique([], eq));
  Assert.eq('', [ 1 ], Util.unique([ 1 ], eq));
  Assert.eq('', [ 1, 2, 3, 4 ], Util.unique([ 1, 1, 2, 2, 2, 3, 4, 4 ], eq));

  const input1: Optional<number>[] = [ Optional.some(50), Optional.some(60), Optional.some(75), Optional.some(95) ];

  Assert.eq('', 10, Util.deduce(input1, 0).getOrDie('m'));
  Assert.eq('', 15, Util.deduce(input1, 1).getOrDie('o'));
  Assert.eq('', 20, Util.deduce(input1, 2).getOrDie('p'));

  const input2: Optional<number>[] = [ Optional.some(50), Optional.none(), Optional.some(80), Optional.some(120) ];

  Assert.eq('', 15, Util.deduce(input2, 0).getOrDie('input2.test0'));
  Assert.eq('', 15, Util.deduce(input2, 1).getOrDie('input2.test1'));
  Assert.eq('', 40, Util.deduce(input2, 2).getOrDie('input2.test2'));
});
