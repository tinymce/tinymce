import { UnitTest } from '@ephox/bedrock';
import { Fun } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

import * as ArrNavigation from 'ephox/alloy/navigation/ArrNavigation';

UnitTest.test('ArrNavigationTest', () => {
  const genUniqueArray = (min, max) => {
    return Jsc.integer(min, max).generator.map((num) => {
      const r = [ ];
      for (let i = 0; i < num; i++) {
        r[i] = i;
      }
      return r;
    });
  };

  const genIndexInArray = (array) => {
    return Jsc.integer(0, array.length - 1).generator;
  };

  const genTestCase = Jsc.nearray(Jsc.integer).generator.flatMap((values1) => {
    return Jsc.nearray(Jsc.integer).generator.flatMap((values2) => {
      const combined = values1.concat(values2);
      return genIndexInArray(combined).map((index) => {
        return {
          values: combined,
          index
        };
      });
    });
  });

  const genUniqueNumTestCase = genUniqueArray(2, 10).flatMap((values) => {
    return genIndexInArray(values).map((index) => {
      return {
        values,
        index
      };
    });
  });

  const arbTestCase = Jsc.bless({
    generator: genTestCase
  });

  // Each value in the array matches its index
  const arbUniqueNumTestCase = Jsc.bless({
    generator: genUniqueNumTestCase
  });

  Jsc.property(
    'Cycling should always be possible in a >= 2 length array',
    arbTestCase,
    (testCase) => {
      ArrNavigation.cycleNext(testCase.values, testCase.index, Fun.constant(true)).getOrDie(
        'Should always be able to cycle next on a >= 2 length array'
      );
      return true;
    }
  );

  Jsc.property(
    'Cycling should never be possible in a >= 2 length array if predicate is never',
    arbTestCase,
    (testCase) => {
      ArrNavigation.cycleNext(testCase.values, testCase.index, Fun.constant(false)).each((_) => {
        throw new Error('Should not have navigatied to: ' + _);
      });
      return true;
    }
  );

  Jsc.property(
    'Cycling across a list of unique numbers of size 2 or greater should be symmetric: after(before(x)) === x',
    arbUniqueNumTestCase,
    (testCase) => {
      const initial = testCase.index;
      const before = ArrNavigation.cyclePrev<number>(testCase.values, initial, Fun.constant(true)).getOrDie(
        'Should always be able to cycle prev on a >= 2 length array'
      );
      // Note, the index is the same as the value, so we can do this.
      const after = ArrNavigation.cycleNext(testCase.values, before, Fun.constant(true)).getOrDie(
        'Should always be able to cycle next on a >= 2 length array'
      );

      return Jsc.eq(initial, after);
    }
  );

  Jsc.property(
    'Cycling across a list of unique numbers of size 2 or greater should be symmetric: before(after(x)) === x',
    arbUniqueNumTestCase,
    (testCase) => {
      const initial = testCase.index;
      const after = ArrNavigation.cycleNext<number>(testCase.values, initial, Fun.constant(true)).getOrDie(
        'Should always be able to cycle next on a >= 2 length array'
      );
      // Note, the index is the same as the value, so we can do this.
      const before = ArrNavigation.cyclePrev(testCase.values, after, Fun.constant(true)).getOrDie(
        'Should always be able to cycle prev on a >= 2 length array'
      );

      return Jsc.eq(initial, before);
    }
  );

  Jsc.property(
    'Cycling next makes an index of 0, or one higher',
    arbUniqueNumTestCase,
    (testCase) => {
      const after = ArrNavigation.cycleNext(testCase.values, testCase.index, Fun.constant(true)).getOrDie(
        'Should always be able to cycle next on a >= 2 length array'
      );

      return Jsc.eq(after, 0) || Jsc.eq(testCase.index + 1, after);
    }
  );

  Jsc.property(
    'Cycling prev makes an index of values.length - 1, or one lower',
    arbUniqueNumTestCase,
    (testCase) => {
      const before = ArrNavigation.cyclePrev(testCase.values, testCase.index, Fun.constant(true)).getOrDie(
        'Should always be able to cycle prev on a >= 2 length array'
      );

      return Jsc.eq(before, testCase.values.length - 1) || Jsc.eq(testCase.index - 1, before);
    }
  );

  Jsc.property(
    'Unique: Try next should be some(+1) or none',
    arbUniqueNumTestCase,
    (testCase) => {
      return ArrNavigation.tryNext(testCase.values, testCase.index, Fun.constant(true)).fold(() => {
        // Nothing, so we must be at the last index position
        return Jsc.eq(testCase.index, testCase.values.length - 1);
      }, (after) => {
        return Jsc.eq(testCase.index + 1, after);
      });
    }
  );

  Jsc.property(
    'Unique: Try prev should be some(-1) or none',
    arbUniqueNumTestCase,
    (testCase) => {
      return ArrNavigation.tryPrev(testCase.values, testCase.index, Fun.constant(true)).fold(() => {
        // Nothing, so we must be at the first index position
        return Jsc.eq(testCase.index, 0);
      }, (before) => {
        return Jsc.eq(testCase.index - 1, before);
      });
    }
  );
});
