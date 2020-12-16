import { Logger } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';

import * as ObjIndex from 'ephox/alloy/alien/ObjIndex';

UnitTest.test('ObjIndexTest', () => {
  const tuple = <T>(k: string, v: T) => ({ country: k, value: v });

  const sortObjValue = (obj: Record<string, any[]>) => Obj.map(obj, (array, _k) => array.slice(0).sort((a, b) => {
    if (a.country < b.country) {
      return -1;
    } else if (a.country > b.country) {
      return +1;
    } else {
      return 0;
    }
  }));

  const assertSortedEq = (label: string, expected: Record<string, any[]>, actual: Record<string, any[]>) => {
    Assert.eq(label, sortObjValue(expected), sortObjValue(actual));
  };

  Logger.sync(
    'Empty test',
    () => {
      const actual = ObjIndex.byInnerKey({}, tuple);
      assertSortedEq('Checking grouping', { }, actual);
    }
  );

  Logger.sync(
    'test 1: basic object ... no overlap',
    () => {
      const actual = ObjIndex.byInnerKey({
        aus: {
          population: 100
        }
      }, tuple);
      assertSortedEq('Checking grouping', {
        population: [{ country: 'aus', value: 100 }]
      }, actual);
    }
  );

  Logger.sync(
    'test 1: basic object ... overlap',
    () => {
      const actual = ObjIndex.byInnerKey({
        aus: {
          population: 100
        },
        canada: {
          population: 300,
          moose: 'yes'
        }
      }, tuple);
      assertSortedEq('Checking grouping', {
        population: [
          { country: 'aus', value: 100 },
          { country: 'canada', value: 300 }
        ],
        moose: [
          { country: 'canada', value: 'yes' }
        ]
      }, actual);
    }
  );

  // TODO: Add more tests.
});
