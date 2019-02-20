import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import * as Injection from 'ephox/phoenix/injection/Injection';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('InsertAtTest', function () {
  const makeUniverse = function () {
    return TestUniverse(
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
          ])
        ])
      ])
    );
  };

  const check = function (expected: string, element: string, offset: number, injection: Gene) {
    const universe = makeUniverse();
    const start = Finder.get(universe, element);
    Injection.atStartOf(universe, start, offset, injection);
    assert.eq(expected, universe.shortlog(function (item) {
      return item.name === 'TEXT_GENE' ? 'text("' + item.text + '")' : item.id;
    }));
  };

  // Start of a text node
  check('root(a(aa(text("INJECTED"),text("aaa"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aaa', 0, TextGene('INJECTED', 'INJECTED'));

  // Middle of a text node
  check('root(a(aa(text("aa"),text("INJECTED"),text("a"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aaa', 2, TextGene('INJECTED', 'INJECTED'));

  // End of a text node
  check('root(a(aa(text("aaa"),text("INJECTED"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aaa', 'aaa'.length, TextGene('INJECTED', 'INJECTED'));

  // Valid child of parent.
  check('root(a(aa(text("INJECTED"),text("aaa"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aa', 0, TextGene('INJECTED', 'INJECTED'));
  // Valid child of parent.
  check('root(a(aa(text("aaa"),text("INJECTED"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aa', 1, TextGene('INJECTED', 'INJECTED'));

  // Last child of parent.
  check('root(a(aa(text("aaa"),text("aab"),text("aac"),text("INJECTED")),ab(text("aba"),text("abb"))))', 'aa', 3, TextGene('INJECTED', 'INJECTED'));

  // Invalid child of parent.
  check('root(a(aa(text("aaa"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aa', 6, TextGene('INJECTED', 'INJECTED'));
});

