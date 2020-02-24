import { assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import * as LeftBlock from 'ephox/robin/api/general/LeftBlock';

UnitTest.test('LeftBlockTest', function () {
  const universe = TestUniverse(Gene('root', 'root', [
    TextGene('t0', 'text0'),
    Gene('p1', 'p', [
      Gene('span1', 'span', [
        TextGene('s1-text', 'bolded-text')
      ]),
      Gene('span2', 'span', [
        TextGene('s2-text', 'italicised-text')
      ]),
      TextGene('t3', 'here')
    ])
  ]));

  const check = function (expected: string[], id: string, method: (u: TestUniverse, i: Gene) => Gene[]) {
    const actual = method(universe, universe.find(universe.get(), id).getOrDie());
    assert.eq(expected, Arr.map(actual, function (x) { return x.id; }));
  };

  check([ 's1-text', 's2-text', 't3' ], 't3', LeftBlock.all);
  check([ 'span1', 'span2', 't3' ], 't3', LeftBlock.top);
  check([ 't0' ], 't0', LeftBlock.all);
});
