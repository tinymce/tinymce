import { Logger, RawAssertions } from '@ephox/agar';
import { assert, UnitTest } from '@ephox/bedrock';
import { Arr, Struct } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import * as PrioritySort from 'ephox/alloy/alien/PrioritySort';

UnitTest.test('PrioritySortTest', () => {
  /* global assert */
  const checkErr = (expected, input, order) => {
    const actual = PrioritySort.sortKeys('test.sort', 'letter', input, order);
    // TODO: Use ResultAssertions test?
    actual.fold((err) => {
      const errMessage = Arr.map(err, (e) => {
        return e.message !== undefined ? e.message : e;
      }).join('');
      RawAssertions.assertEq('Checking the error of priority sort', errMessage.indexOf(expected) > -1, true);
    }, (val) => {
      assert.fail('Priority sort should have thrown error: ' + expected + '\nWas: ' + Json.stringify(val, null, 2));
    });
  };

  const checkVal = (expected, input, order) => {
    const actual = PrioritySort.sortKeys('test.sort', 'letter', input, order);
    actual.fold((err) => {
      assert.fail('Unexpected error: ' + err + '\nWas wanting value(' + Json.stringify(expected, null, 2) + ')');
    }, (val) => {
      RawAssertions.assertEq('Checking the value of priority sort', expected, Arr.map(val, (v) => v.letter()));
    });
  };

  const letter = Struct.immutable('letter');
  const letters = (ls) => {
    return Arr.map(ls, (l) => letter(l));
  };

  Logger.sync(
    'Checking [ a, d, f ] ordering',
    () => {
      return checkErr(
        'The ordering for test.sort does not have an entry for a',
        letters([ 'a', 'd', 'f' ]), [ 'e', 'f', 'b', 'c', 'd' ]
      );
    }
  );

  Logger.sync(
    'Checking [ a, d, f ] ordering when all specified',
    () => {
      return checkVal(
        [ 'a', 'd', 'f' ],
        letters([ 'a', 'd', 'f' ]), [ 'a', 'b', 'c', 'd', 'e', 'f' ]
      );
    }
  );
});
