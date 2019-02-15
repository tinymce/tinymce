import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import * as Split from 'ephox/phoenix/api/general/Split';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('IdentifyTest', function() {
  var check = function (all, expected, baseid, baseoffset, endid, endoffset, input) {
    var universe = TestUniverse(input);
    var base = Finder.get(universe, baseid);
    var end = Finder.get(universe, endid);
    var actual = Split.range(universe, base, baseoffset, end, endoffset);
    assert.eq(expected, TestRenders.texts(actual));
    assert.eq(all, TestRenders.texts(universe.get().children));
  };

  check([ 'C', 'aterpillar', 'Go', 'rilla' ], [ 'aterpillar', 'Go' ], 'a', 1, 'b', 2, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'C', 'aterpillar', 'Mogel', 'Go', 'rilla' ], [ 'aterpillar', 'Mogel', 'Go' ], 'a', 1, 'b', 2, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'Caterpillar', 'Mogel', 'Gorilla' ], [ 'Caterpillar', 'Mogel', 'Gorilla' ], 'a', 0, 'b', 7, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'C', 'aterpillar', 'Mogel', 'Gorilla' ], [ 'aterpillar', 'Mogel', 'Gorilla' ], 'a', 1, 'b', 7, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'C', 'aterpillar', 'Mogel', 'Gorilla' ], [ 'aterpillar', 'Mogel' ], 'a', 1, 'b', 0, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'Caterpillar', 'Mogel', 'Gorilla' ], [ 'Mogel' ], 'a', 11, 'b', 0, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'Caterpillar', 'Mogel', 'G', 'orilla' ], [ 'Mogel', 'G' ], 'a', 11, 'b', 1, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'Caterpillar', 'Mogel', 'G', 'orilla' ], [ 'Mogel', 'G' ], 'b', 1, 'a', 11, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));
});

