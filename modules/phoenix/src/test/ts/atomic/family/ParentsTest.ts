import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse } from '@ephox/boss';
import * as Parents from 'ephox/phoenix/family/Parents';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('ParentsTest', function () {
  const doc = TestUniverse(
    Gene('root', 'root', [
      Gene('a', '', [
        Gene('aa', '', [
          Gene('aaa', '', []),
          Gene('aab', '', [
            Gene('aaba', '', [
              Gene('aabaa', '', []),
              Gene('aabab', '', [])
            ])
          ])
        ]),
        Gene('ab', '', [
          Gene('aba', '', []),
          Gene('abb', '', []),
          Gene('abc', '', [
            Gene('abca', '', []),
            Gene('abcb', '', []),
            Gene('abcc', '', [
              Gene('abcca', '', [])
            ])
          ])
        ]),
        Gene('ac', '', [
          Gene('aca', '', [])
        ])
      ]),
      Gene('b', '', [])
    ])
  );

  const check = function (expected: string, first: string, last: string) {
    const start = Finder.get(doc, first);
    const finish = Finder.get(doc, last);
    const actual = Parents.common(doc, start, finish);
    assert.eq(expected, actual.getOrDie('No common parent').id);
  };

  check('abc', 'abc', 'abcc');
  check('a', 'aa', 'abcca');
  check('b', 'b', 'b');
  check('ab', 'aba', 'abb');
});

