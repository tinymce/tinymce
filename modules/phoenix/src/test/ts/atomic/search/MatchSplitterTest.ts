import { Assert, describe, it } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';
import { PositionArray, PRange } from '@ephox/polaris';

import * as Spot from 'ephox/phoenix/api/data/Spot';
import * as MatchSplitter from 'ephox/phoenix/search/MatchSplitter';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';

interface CheckExpect {
  readonly text: string[];
  readonly exact: string;
  readonly word: string;
}

describe('atomic.phoenix.search.MatchSplitterTest', () => {
  const check = (all: string[], expected: CheckExpect[], ids: string[], matches: (PRange & { word: string })[], input: Gene) => {
    const universe = TestUniverse(input);
    const items = Finder.getAll(universe, ids);
    const list = PositionArray.generate(items, (item, start) => {
      const finish = start + universe.property().getText(item).length;
      return Optional.some(Spot.range(item, start, finish));
    });

    const actual = MatchSplitter.separate(universe, list, matches);
    Assert.eq('Asserting length of result', expected.length, actual.length);
    Assert.eq(`Asserting result of MatchSplitter.separate for word: "${all.join('')}"`, expected, Arr.map(actual, (a) => {
      return {
        text: TestRenders.texts(a.elements),
        exact: a.exact,
        word: a.word
      };
    }));

    Assert.eq(`Asserting result for word: "${all.join('')}"`, all, TestRenders.texts(universe.get().children));

  };

  const match = (start: number, finish: number, word: string): PRange & { word: string } => {
    return {
      start,
      finish,
      word
    };
  };

  it('TINY-10062: MatchSplitter Test', () => {
    /*
      This is obviously not an easy thing to test, so there are key attributes that this test is
      targeting. Firstly, that the text nodes are broken up as specified by the match positions.
      Secondly, that the matches created for each equivalent match have passed through the information
      correctly. The output format is transformed significantly so this isn't testing the output value
      as transparently as was desired.
    */
    check([ 'AB', 'C', 'D', 'E', 'FG', 'H', 'I', 'JK', 'L', 'MNO', 'P' ],
      [
        { text: [ 'C', 'D' ], exact: 'CD', word: 'w1' },
        { text: [ 'FG' ], exact: 'FG', word: 'w2' },
        { text: [ 'I', 'JK' ], exact: 'IJK', word: 'w3' },
        { text: [ 'L', 'MNO' ], exact: 'LMNO', word: 'w4' }
      ],
      [ '1', '2', '3', '4', '5' ],
      [ match(2, 4, 'w1'), match(5, 7, 'w2'), match(8, 11, 'w3'), match(11, 15, 'w4') ],
      Gene('root', 'root', [
        TextGene('1', 'AB'),
        TextGene('2', 'C'),
        TextGene('3', 'DEFGHI'),
        TextGene('4', 'JKL'),
        TextGene('5', 'MNOP')
      ])
    );

    check([ '<p>', ' ', 'Hello', ' ', 'World<', '/', 'p>' ],
      [
        { text: [ '<p>' ], exact: '<p>', word: '<p>' },
        { text: [ 'Hello' ], exact: 'Hello', word: 'Hello' },
        { text: [ 'World<' ], exact: 'World<', word: 'World<' },
        { text: [ 'p>' ], exact: 'p>', word: 'p>' },
      ],
      [ '1' ],
      [ match(0, 3, '<p>'), match(4, 9, 'Hello'), match(10, 16, 'World<'), match(17, 19, 'p>') ],
      Gene('root', 'root', [
        TextGene('1', '<p> Hello World</p>'),
      ])
    );

    check([ '<p>Hello', ' ', 'World<', '/', 'p>' ],
      [
        { text: [ '<p>Hello' ], exact: '<p>Hello', word: '<p>Hello' },
        { text: [ 'World<' ], exact: 'World<', word: 'World<' },
        { text: [ 'p>' ], exact: 'p>', word: 'p>' },
      ],
      [ '1' ],
      [ match(0, 8, '<p>Hello'), match(9, 15, 'World<'), match(16, 18, 'p>') ],
      Gene('root', 'root', [
        TextGene('1', '<p>Hello World</p>'),
      ])
    );

    check([ '<p>Hello', ' ', 'World', ' ', '<', '/', 'p>' ],
      [
        { text: [ '<p>Hello' ], exact: '<p>Hello', word: '<p>Hello' },
        { text: [ 'World' ], exact: 'World', word: 'World' },
        { text: [ '<' ], exact: '<', word: '<' },
        { text: [ 'p>' ], exact: 'p>', word: 'p>' },
      ],
      [ '1' ],
      [ match(0, 8, '<p>Hello'), match(9, 14, 'World'), match(15, 16, '<'), match(17, 19, 'p>') ],
      Gene('root', 'root', [
        TextGene('1', '<p>Hello World </p>'),
      ])
    );

    check([ '<p>', ' ', 'Hello', ' ', 'World', ' ', '<', '/', 'p>' ],
      [
        { text: [ '<p>' ], exact: '<p>', word: '<p>' },
        { text: [ 'Hello' ], exact: 'Hello', word: 'Hello' },
        { text: [ 'World' ], exact: 'World', word: 'World' },
        { text: [ '<' ], exact: '<', word: '<' },
        { text: [ 'p>' ], exact: 'p>', word: 'p>' },
      ],
      [ '1' ],
      [ match(0, 3, '<p>'), match(4, 9, 'Hello'), match(10, 15, 'World'), match(16, 17, '<'), match(18, 20, 'p>') ],
      Gene('root', 'root', [
        TextGene('1', '<p> Hello World </p>'),
      ])
    );

    check([ 'Test. [', 'IF:INTEXT', ']Test2 [/', 'IF', ']' ],
      [
        { text: [ 'IF:INTEXT' ], exact: 'IF:INTEXT', word: 'IF:INTEXT' },
        { text: [ 'IF' ], exact: 'IF', word: 'IF' },
      ],
      [ '1' ],
      [ match(7, 16, 'IF:INTEXT'), match(25, 27, 'IF') ],
      Gene('root', 'root', [
        TextGene('1', 'Test. [IF:INTEXT]Test2 [/IF]'),
      ])
    );

    check([ 'Test. [/', 'IF', ']Test2 [', 'IF:INTEXT', ']' ],
      [
        { text: [ 'IF' ], exact: 'IF', word: 'IF' },
        { text: [ 'IF:INTEXT' ], exact: 'IF:INTEXT', word: 'IF:INTEXT' },
      ],
      [ '1' ],
      [ match(8, 10, 'IF'), match(18, 27, 'IF:INTEXT') ],
      Gene('root', 'root', [
        TextGene('1', 'Test. [/IF]Test2 [IF:INTEXT]'),
      ])
    );
  });
});
