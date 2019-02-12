import Gene from 'ephox/boss/api/Gene';
import TestUniverse from 'ephox/boss/api/TestUniverse';
import Query from 'ephox/boss/mutant/Query';
import { Option } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('QueryTest', function() {
  var universe = TestUniverse(Gene('1', 'root', [
    Gene('1.1', 'duck', [
      Gene('1.1.1', 'goose', []),
      Gene('1.1.2', 'goose', [
        Gene('1.1.2.1', 'duck', []),
        Gene('1.1.2.2', 'duck', [
          Gene('1.1.2.2.1', 'goose', [])
        ])
      ]),
      Gene('1.1.3', 'duck', []),
      Gene('1.1.4', 'duck', [
        Gene('1.1.4.1', 'duck', [])
      ])
    ])
  ]));

  var checkPrev = function (expected, id) {
    var first = universe.find(universe.get(), id).getOrDie();
    var actual = Query.prevSibling(first).getOr({ id: '_nope_' });
    assert.eq(expected, actual.id);
  };

  var checkNext = function (expected, id) {
    var first = universe.find(universe.get(), id).getOrDie();
    var actual = Query.nextSibling(first).getOr({ id: '_nope_' });
    assert.eq(expected, actual.id);
  };

  var checkPosition = function (expected, one, other) {
    var first = universe.find(universe.get(), one).getOrDie();
    var last = universe.find(universe.get(), other).getOrDie();

    var actual = Query.comparePosition(first, last);
    assert.eq(expected, actual);
  };

  checkPosition(4, '1.1.1', '1.1.2');
  checkPosition(2, '1.1.2', '1.1.1');
  checkPosition(4, '1.1.1', '1.1.4.1');

  checkPrev('_nope_', '1.1.2.2.1');
  checkPrev('1.1.3', '1.1.4');

  checkNext('1.1.2', '1.1.1');
  checkNext('_nope_', '1.1.4');
});

