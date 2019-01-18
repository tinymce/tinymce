import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import Spot from 'ephox/phoenix/api/data/Spot';
import Splitter from 'ephox/phoenix/search/Splitter';
import Finder from 'ephox/phoenix/test/Finder';
import TestRenders from 'ephox/phoenix/test/TestRenders';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('SplitterTest', function() {
  var checkSubdivide = function (toplevel, expected, id, positions, data) {
    var universe = TestUniverse(data);
    var item = Finder.get(universe, id);
    var actual = Splitter.subdivide(universe, item, positions);
    assert.eq(expected.length, actual.length, 'Incorrect size for subdivide test');
    Arr.each(expected, function (exp, i) {
      var act = actual[i];
      // TODO: Consider removing an expected id from the test case as it isn't really representing anything meaningful
      assert.eq(exp.id, act.element().id);
      assert.eq(exp.start, act.start(), 'comparing start for ' + exp.id + ': ' + exp.start + ' vs ' + act.start());
      assert.eq(exp.finish, act.finish(), 'comparing finish for ' + exp.id + ': ' + exp.finish + ' vs ' + act.finish());
      assert.eq(exp.text, act.element().text);
    });

    assert.eq(toplevel, Arr.map(universe.get().children, TestRenders.text));
  };

  checkSubdivide([ '_', 'abcdefghijklm', 'n', 'opq', 'rstuvwxyz' ], [
    { id: 'a', start: 0, finish: 1, text: '_' },
    { id: '?_abcdefghijklm', start: 1, finish: 14, text: 'abcdefghijklm' },
    { id: '?_n', start: 14, finish: 15, text: 'n' },
    { id: '?_opq', start: 15, finish: 18, text: 'opq' },
    { id: '?_rstuvwxyz', start: 18, finish: 27, text: 'rstuvwxyz' }
  ], 'a', [ 1, 14, 15, 18 ], Gene('root', 'root', [
    TextGene('a', '_abcdefghijklmnopqrstuvwxyz')
  ]));

  checkSubdivide([ '_abcdefghijklmnopqrstuvwxyz' ], [
    { id: 'a', start: 0, finish: 27, text: '_abcdefghijklmnopqrstuvwxyz' }
  ], 'a', [ 100 ], Gene('root', 'root', [
    TextGene('a', '_abcdefghijklmnopqrstuvwxyz')
  ]));
});

