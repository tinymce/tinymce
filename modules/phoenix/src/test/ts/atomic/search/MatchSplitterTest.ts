import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr, Fun, Option } from '@ephox/katamari';
import { PositionArray, PRange } from '@ephox/polaris';
import * as Spot from 'ephox/phoenix/api/data/Spot';
import * as MatchSplitter from 'ephox/phoenix/search/MatchSplitter';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';

UnitTest.test('MatchSplitterTest', function () {
  const data = function () {
    return Gene('root', 'root', [
      TextGene('1', 'AB'),
      TextGene('2', 'C'),
      TextGene('3', 'DEFGHI'),
      TextGene('4', 'JKL'),
      TextGene('5', 'MNOP')
    ]);
  };

  interface CheckExpect {
    text: string[];
    exact: string;
    word: string;
  }

  const check = function (all: string[], expected: CheckExpect[], ids: string[], matches: (PRange & { word: () => string })[], input: Gene) {
    const universe = TestUniverse(input);
    const items = Finder.getAll(universe, ids);
    const list = PositionArray.generate(items, function (item, start) {
      const finish = start + universe.property().getText(item).length;
      return Option.some(Spot.range(item, start, finish));
    });

    const actual = MatchSplitter.separate(universe, list, matches);
    assert.eq(expected.length, actual.length, 'Wrong sizes for MatchSplitter');
    assert.eq(expected, Arr.map(actual, function (a) {
      return {
        text: TestRenders.texts(a.elements()),
        exact: a.exact(),
        word: a.word()
      };
    }));

    assert.eq(all, TestRenders.texts(universe.get().children));

  };

  const match = function (start: number, finish: number, word: string): PRange & { word: () => string } {
    return {
      start: Fun.constant(start),
      finish: Fun.constant(finish),
      word: Fun.constant(word)
    };
  };

  /*
    This is obviously not an easy thing to test, so there are key attributes that this test is
    targeting. Firstly, that the text nodes are broken up as specified by the match positions.
    Secondly, that the matches created for each equivalent match have passed through the information
    correctly. The output format is transformed significantly so this isn't testing the output value
    as transparently as was desired.
  */
  check(['AB', 'C', 'D', 'E', 'FG', 'H', 'I', 'JK', 'L', 'MNO', 'P'], [
    { text: ['C', 'D'], exact: 'CD', word: 'w1' },
    { text: ['FG'], exact: 'FG', word: 'w2' },
    { text: ['I', 'JK'], exact: 'IJK', word: 'w3' },
    { text: ['L', 'MNO'], exact: 'LMNO', word: 'w4' }
  ], ['1', '2', '3', '4', '5'], [match(2, 4, 'w1'), match(5, 7, 'w2'), match(8, 11, 'w3'), match(11, 15, 'w4')], data());
});
