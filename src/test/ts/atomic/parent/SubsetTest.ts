import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Subset from 'ephox/robin/parent/Subset';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('SubsetTest', function() {
  var universe = TestUniverse(Gene('root', 'root', [
    Gene('one-nine', 'ol', [
      Gene('one', 'li', [
        TextGene('1-text', 'One')
      ]),
      Gene('two', 'li', [ TextGene('2-text', 'Two') ]),
      Gene('three-five', 'ol', [
        Gene('three', 'li', [ TextGene('3-text', 'three') ]),
        Gene('four', 'li', [ TextGene('4-text', 'four') ]),
        Gene('five', 'li', [ TextGene('5-text', 'five') ])
      ]),
      Gene('six', 'li', [ TextGene('6-text', 'six') ]),
      Gene('seven-nine', 'ol', [
        Gene('seven-eight', 'ol', [
          Gene('seven', 'li', [ TextGene('7-text', 'seven') ]),
          Gene('eight', 'li', [ TextGene('8-text', 'eight') ])
        ])
      ])
    ])
  ]));

  var check = function (expected, startId, finishId) {
    var start = universe.find(universe.get(), startId).getOrDie();
    var finish = universe.find(universe.get(), finishId).getOrDie();

    var subset = Subset.subset(universe, start, finish);
    expected.fold(function () {
      assert.eq(true, subset.isNone());
    }, function (exp) {
      subset.fold(function () {
        assert.fail('Expected some, was none');
      }, function (actual) {
        assert.eq(exp, Arr.map(actual, function (x) { return x.id; }));
      });
    });
  };

  check(Option.some(['three-five']), 'three-five', 'five');
  check(Option.some(['three-five']), 'five', 'three-five');
  check(Option.some(['two', 'three-five']), 'two', 'five');
  check(Option.some(['two', 'three-five']), 'two', 'four');
  check(Option.some(['two', 'three-five', 'six', 'seven-nine']), 'two', 'eight');
});

