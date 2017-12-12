import { Logger } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import ObjIndex from 'ephox/alloy/alien/ObjIndex';
import { Obj } from '@ephox/katamari';
import { UnitTest } from '@ephox/refute';

UnitTest.test('ObjIndexTest', function() {
  var tuple = function (k, v) {
    return { country: k, value: v };
  };

  var sortObjValue = function (obj) {
    return Obj.map(obj, function (array, k) {
      return array.slice(0).sort(function (a, b) {
        if (a.country < b.country) return -1;
        else if (a.country > b.country) return +1;
        else return 0;
      });
    });
  };

  var assertSortedEq = function (label, expected, actual) {
    RawAssertions.assertEq(label, sortObjValue(expected), sortObjValue(actual));
  };

  Logger.sync(
    'Empty test',
    function () {
      var actual = ObjIndex.byInnerKey({}, tuple);
      assertSortedEq('Checking grouping', { }, actual);
    }
  );

  Logger.sync(
    'test 1: basic object ... no overlap',
    function () {
      var actual = ObjIndex.byInnerKey({
        'aus': {
          'population': 100
        }
      }, tuple);
      assertSortedEq('Checking grouping', {
        population: [ { country: 'aus', value: 100 }]
      }, actual);
    }
  );

  Logger.sync(
    'test 1: basic object ... overlap',
    function () {
      var actual = ObjIndex.byInnerKey({
        'aus': {
          'population': 100
        },
        'canada': {
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

