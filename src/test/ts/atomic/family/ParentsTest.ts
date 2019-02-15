import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import * as Parents from 'ephox/phoenix/family/Parents';
import * as Finder from 'ephox/phoenix/test/Finder';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ParentsTest', function() {
  var doc = TestUniverse(
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

  var check = function (expected, first, last) {
    var start = Finder.get(doc, first);
    var finish = Finder.get(doc, last);
    var actual = Parents.common(doc, start, finish);
    assert.eq(expected, actual.getOrDie().id);
  };

  check('abc', 'abc', 'abcc');
  check('a', 'aa', 'abcca');
  check('b', 'b', 'b');
  check('ab', 'aba', 'abb');
});

