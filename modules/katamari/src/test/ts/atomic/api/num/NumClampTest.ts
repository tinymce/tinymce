import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Num from 'ephox/katamari/api/Num';

UnitTest.test('Num.clamp', () => {
  fc.assert(fc.property(
    fc.nat(1000),
    fc.nat(1000),
    fc.nat(1000),
    (a, b, c) => {
      const low = a;
      const med = low + b;
      const high = med + c;
      // low <= med <= high
      Assert.eq('Number should be unchanged when item is within bounds', med, Num.clamp(med, low, high));
      Assert.eq('Number should snap to min', med, Num.clamp(med, low, high));
      Assert.eq('Number should snap to max', med, Num.clamp(high, low, med));
    }));
});
