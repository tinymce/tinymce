import { UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import * as Gather from 'ephox/phoenix/api/general/Gather';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('Seeker Test', () => {
  const some = Optional.some;

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

  const isRoot = (item: Gene) => {
    return item.id === 'root';
  };

  const check = (expected: Optional<string>, actual: Optional<Gene>) => {
    KAssert.eqOptional('eq', expected, actual.map((x) => x.id));
  };

  const checkBefore = (expected: Optional<string>, id: string) => {
    const item = Finder.get(universe, id);
    const actual = Gather.before(universe, item, isRoot);
    check(expected, actual);
  };

  const checkAfter = (expected: Optional<string>, id: string) => {
    const item = Finder.get(universe, id);
    const actual = Gather.after(universe, item, isRoot);
    check(expected, actual);
  };

  checkBefore(some('aab'), 'aac');
  checkBefore(some('aaa'), 'aab');

  checkBefore(Optional.none(), 'aaa');
  checkBefore(Optional.none(), 'aa');
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
  checkAfter(Optional.none(), 'd');
});
