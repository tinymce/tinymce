import Gene from 'ephox/boss/api/Gene';
import Down from 'ephox/boss/mutant/Down';
import Locator from 'ephox/boss/mutant/Locator';
import Tracks from 'ephox/boss/mutant/Tracks';
import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('DownTest', function() {
  var family = Tracks.track(
    Gene('1', 'root', [
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
    ]), Option.none());

  var check = function (expected, actual) {
    assert.eq(expected, Arr.map(actual, function (item) {
      return item.id;
    }));
  };

  var checkSelector = function (expected, query) {
    var actual = Down.selector(family, query);
    check(expected, actual);
  };

  var checkPredicate = function (expected, id, predicate) {
    var start = Locator.byId(family, id).getOrDie('Did not find start: ' + id);
    var actual = Down.predicate(start, predicate);
    check(expected, actual);
  };

  checkSelector(['1.1.1', '1.1.2', '1.1.2.2.1'], 'goose');
  checkSelector(['1.1', '1.1.2.1', '1.1.2.2', '1.1.3', '1.1.4', '1.1.4.1'], 'duck');
  checkSelector(['1.1', '1.1.1', '1.1.2', '1.1.2.1', '1.1.2.2', '1.1.2.2.1', '1.1.3', '1.1.4', '1.1.4.1'], 'duck,goose');
  checkSelector(['1.1', '1.1.1', '1.1.2', '1.1.2.1', '1.1.2.2', '1.1.2.2.1', '1.1.3', '1.1.4', '1.1.4.1'], 'root,duck,goose');

  checkPredicate([], '1.1.4', function (item) {
    return item.name.indexOf('g') > -1;
  });

  checkPredicate(['1.1.1', '1.1.2', '1.1.2.2.1'], '1.1', function (item) {
    return item.name.indexOf('g') > -1;
  });
});

