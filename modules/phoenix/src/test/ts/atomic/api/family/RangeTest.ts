import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import * as Family from 'ephox/phoenix/api/general/Family';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('RangeTest', function () {
  const doc = TestUniverse(
    Gene('root', 'root', [
      Gene('a', 'div', [
        Gene('aa', 'div', [
          TextGene('aaa', 'once upon a time'),
          Gene('aab', 'div', [
            Gene('aaba', 'div', [
              Gene('aabaa', 'img', []),
              TextGene('aabab', ' there was a dragon')
            ])
          ])
        ]),
        Gene('ab', 'div', [
          TextGene('aba', ' called '),
          TextGene('abb', ' not-dragon, '),
          Gene('abc', 'div', [
            Gene('abca', 'br', []),
            TextGene('abcb', 'and that dragon'),
            TextGene('abcc', 'stayed in a far away land'),
            Gene('abcd', 'div', [
              TextGene('abcda', 'free of contaminants')
            ])
          ])
        ]),
        Gene('ac', 'div', [
          TextGene('aca', ' --- OCD he was, ')
        ])
      ]),
      TextGene('b', 'yes')
    ])
  );

  const check = function (expected: string[], startId: string, finishId: string, delta1: number, delta2: number) {
    const start = Finder.get(doc, startId);
    const finish = Finder.get(doc, finishId);
    const actual = Family.range(doc, start, delta1, finish, delta2);
    assert.eq(expected, Arr.map(actual, function (x) { return x.id; }));
  };

  check(['a'], 'a', 'a', 0, 0); // This doesn't check that it is a text node. Is that a problem?
  check(['aaa', 'aabab', 'aba', 'abb'], 'aaa', 'abca', 0, 0);
  check(['aaa'], 'aaa', 'aaa', 1, 1);
  check(['aabab', 'aba', 'abb', 'abcb', 'abcc', 'abcda'], 'aabab', 'aca', 0, 0);
  check(['aabab', 'aba', 'abb', 'abcb', 'abcc', 'abcda', 'aca'], 'aabab', 'aca', 0, 1);
  check(['aba', 'abb', 'abcb', 'abcc', 'abcda', 'aca'], 'aabab', 'aca', 1, 1);

  check(['abcb', 'abcc'], 'abc', 'abcda', 0, 0);
  check(['aaa', 'aabab', 'aba', 'abb', 'abcb', 'abcc', 'abcda'], 'aa', 'ac', 0, 1);
});

