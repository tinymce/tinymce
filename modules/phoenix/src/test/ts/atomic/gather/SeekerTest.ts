import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import * as Gather from 'ephox/phoenix/api/general/Gather';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('Seeker Test', function () {
  const some = Option.some;

  const universe = TestUniverse(
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

  const isRoot = function (item: Gene) {
    return item.id === 'root';
  };

  const check = function (expected: Option<string>, actual: Option<Gene>) {
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

  const checkBefore = function (expected: Option<string>, id: string) {
    const item = Finder.get(universe, id);
    const actual = Gather.before(universe, item, isRoot);
    check(expected, actual);
  };

  const checkAfter = function (expected: Option<string>, id: string) {
    const item = Finder.get(universe, id);
    const actual = Gather.after(universe, item, isRoot);
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

