import { assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import * as Group from 'ephox/phoenix/family/Group';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';

UnitTest.test('GroupTest', function () {
  const doc = TestUniverse(
    Gene('root', 'root', [
      Gene('1', 'div', [
        Gene('1.1', 'p', [
          Gene('1.1.1', 'img', []),
          TextGene('1.1.2', 'post-image text')
        ]),
        Gene('1.2', 'p', [
          TextGene('1.2.1', 'This is text'),
          Gene('1.2.2', 'span', [
            TextGene('1.2.2.1', 'inside a span')
          ]),
          TextGene('1.2.3', 'More text'),
          Gene('1.2.4', 'em', [
            TextGene('1.2.4.1', 'Inside em')
          ]),
          TextGene('1.2.5', 'Last piece of text')
        ])
      ])
    ])
  );

  const check = function (expected: string[][], ids: string[]) {
    const items = Arr.map(ids, function (id) {
      return Finder.get(doc, id);
    });
    const actual = Group.group(doc, items);
    assert.eq(expected, Arr.map(actual, function (xs) {
      return Arr.map(xs, TestRenders.typeditem);
    }));
  };

  check([
    [ 'empty(1.1.1)' ],
    [ 'text("post-image text")' ],
    [ 'text("This is text")', 'text("inside a span")', 'text("More text")', 'text("Inside em")', 'text("Last piece of text")' ]
  ], [ '1' ]);

  check([
    [ 'empty(1.1.1)' ],
    [ 'text("post-image text")' ]
  ], [ '1.1' ]);
});
