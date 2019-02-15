import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import * as Gather from 'ephox/phoenix/api/general/Gather';
import * as Finder from 'ephox/phoenix/test/Finder';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Seeker Test', function() {
  var some = Option.some;

  var universe = TestUniverse(
    Gene('root', 'root', [
      Gene('a', 'node', [
        Gene('aa', 'node', [
          TextGene('aaa', 'aaa'),
          TextGene('aab', 'aab'),
          TextGene('aac', 'aac')
        ]),
        Gene('ab', 'node', [
          TextGene('aba', 'aba'),
          TextGene('abb', 'abb')
        ]),
        Gene('b', 'node', [
          TextGene('ba', 'ba')
        ]),
        Gene('c', 'node', [
          Gene('ca', 'node', [
            Gene('caa', 'node', [
              TextGene('caaa', 'caaa')
            ])
          ]),
          Gene('cb', 'node', []),
          Gene('cc', 'node', [
            TextGene('cca', 'cca')
          ])
        ]),
        TextGene('d', 'd')
      ])
    ])
  );

  var isRoot = function (item) {
    return item.id === 'root';
  };

  var check = function (expected, actual) {
    actual.fold(function () {
      assert.eq(true, expected.isNone());
    }, function (act) {
      expected.fold(function () {
        assert.fail('Expected none, Actual: ' + act);
      }, function (exp) {
        assert.eq(exp, act.id);
      });
    });
  };

  var checkBefore = function (expected, id) {
    var item = Finder.get(universe, id);
    var actual = Gather.before(universe, item, isRoot);
    check(expected, actual);
  };

  var checkAfter = function (expected, id) {
    var item = Finder.get(universe, id);
    var actual = Gather.after(universe, item, isRoot);
    check(expected, actual);
  };

  checkBefore(some('aab'), 'aac');
  checkBefore(some('aaa'), 'aab');

  checkBefore(Option.none(), 'aaa');
  checkBefore(Option.none(), 'aa');
  checkBefore(some('aac'), 'aba');
  checkBefore(some('aba'), 'abb');
  checkBefore(some('abb'), 'ba');
  checkBefore(some('ba'), 'caaa');
  checkBefore(some('caaa'), 'cb');
  checkBefore(some('cb'), 'cca');
  checkBefore(some('cca'), 'd');

  checkAfter(some('aab'), 'aaa');
  checkAfter(some('aac'), 'aab');
  checkAfter(some('aba'), 'aac');
  checkAfter(some('abb'), 'aba');
  checkAfter(some('ba'), 'abb');
  checkAfter(some('caaa'), 'ba');
  checkAfter(some('cb'), 'caaa');
  checkAfter(some('cca'), 'cb');
  checkAfter(some('d'), 'cca');
  checkAfter(Option.none(), 'd');
});

