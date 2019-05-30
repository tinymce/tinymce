import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import LeftBlock from 'ephox/robin/api/general/LeftBlock';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('LeftBlockTest', function() {
  var universe = TestUniverse(Gene('root', 'root', [
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

  var check = function (expected, id, method) {
    var actual = method(universe, universe.find(universe.get(), id).getOrDie());
    assert.eq(expected, Arr.map(actual, function (x) { return x.id; }));
  };

  check([ 's1-text', 's2-text', 't3' ], 't3', LeftBlock.all);
  check([ 'span1', 'span2', 't3' ], 't3', LeftBlock.top);
  check([ 't0' ], 't0', LeftBlock.all);
});

