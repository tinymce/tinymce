import { Logger } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Struct } from '@ephox/katamari';

import * as PrioritySort from 'ephox/alloy/alien/PrioritySort';

UnitTest.test('PrioritySortTest', () => {
  const checkErr = <T extends Record<string, () => any>>(expected: string, input: T[], order: string[]) => {
    const actual = PrioritySort.sortKeys('test.sort', 'letter', input, order);
    // TODO: Use ResultAssertions test?
    actual.fold((err) => {
      const errMessage = Arr.map(err, (e) => {
        return e.message !== undefined ? e.message : e;
      }).join('');
      Assert.eq('Checking the error of priority sort', errMessage.indexOf(expected) > -1, true);
    }, (val) => {
      Assert.fail('Priority sort should have thrown error: ' + expected + '\nWas: ' + JSON.stringify(val, null, 2));
    });
  };

  const checkVal = <T extends Record<string, () => any>>(expected: string[], input: T[], order: string[]) => {
    const actual = PrioritySort.sortKeys('test.sort', 'letter', input, order);
    actual.fold((err) => {
      Assert.fail('Unexpected error: ' + err + '\nWas wanting value(' + JSON.stringify(expected, null, 2) + ')');
    }, (val) => {
      Assert.eq('Checking the value of priority sort', expected, Arr.map(val, (v) => v.letter()));
    });
  };

  const letter = Struct.immutable('letter');
  const letters = (ls: string[]) => {
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
