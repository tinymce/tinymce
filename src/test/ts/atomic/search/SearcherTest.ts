import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import * as Searcher from 'ephox/phoenix/search/Searcher';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('SearcherTest', function() {
  /*
    An example of some <b>test</b> data. The word being looked for will be word and for.

    There will be a couple of paragraphs. Some ending with fo

    r and more.

    <p>An example of some <span>test</span>data. The words being looked for will be word and for and test.</p>
    <p>There will be three paragraphs. This one ends with partial fo</p>
    <p>r and more.</p>
  */
  var data = function () {
    return Gene('root', 'root', [
      Gene('p1', 'p', [
        TextGene('p1-a', 'An example of some '),
        Gene('span1', 'span', [
          TextGene('span1-a', 'test')
        ]),
        TextGene('p1-b', ' data. The word being looked for will be w'),
        Gene('span1b', 'span', [
          Gene('span1ba', 'span', [
            TextGene('p1-c', 'or')
          ])
        ]),
        TextGene('p1-d', 'd and for.')
      ]),
      Gene('p2', 'p', [
        TextGene('p2-a', 'There will be some tes'),
        Gene('span2', 'span', [
          TextGene('span2-a', 't')
        ]),
        TextGene('p2-b', ' paragraphs. This one ends with a partial fo')
      ]),
      Gene('p3', 'p', [
        TextGene('p3-a', 'r and more.')
      ])
    ]);
  };

  var checkWords = function (expected, itemIds, words, input) {
    var universe = TestUniverse(input);
    var items = Finder.getAll(universe, itemIds);
    var actual = Searcher.safeWords(universe, items, words, Fun.constant(false));

    var processed = Arr.map(actual, function (match) {
      return {
        items: TestRenders.texts(match.elements()),
        word: match.word(),
        exact: match.exact()
      };
    });
    assert.eq(expected, processed);
  };

  //An example of some <test> data. The <word> being looked <for> will be <w_or_d> and <for>.|There will be some <tes_t>
  //paragraphs. This one ends with a partial fo|r and more.

  checkWords( [
    { items: [ 'test' ], word: 'test', exact: 'test' },
    { items: [ 'word' ], word: 'word', exact: 'word' },
    { items: [ 'for' ], word: 'for', exact: 'for' },
    { items: [ 'w', 'or', 'd' ], word: 'word', exact: 'word' },
    { items: [ 'for' ], word: 'for', exact: 'for' },
    { items: [ 'tes', 't' ], word: 'test', exact: 'test' }
  ], [ 'p1', 'p2', 'p3' ], [ 'for', 'test', 'word' ], data());
});

