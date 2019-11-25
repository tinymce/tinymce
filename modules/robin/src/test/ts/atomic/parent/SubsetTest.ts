import { UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr, Option } from '@ephox/katamari';
import Subset from 'ephox/robin/parent/Subset';
import { KAssert } from '@ephox/katamari-assertions';

UnitTest.test('SubsetTest', function () {
  const universe = TestUniverse(Gene('root', 'root', [
    Gene('one-nine', 'ol', [
      Gene('one', 'li', [
        TextGene('1-text', 'One')
      ]),
      Gene('two', 'li', [TextGene('2-text', 'Two')]),
      Gene('three-five', 'ol', [
        Gene('three', 'li', [TextGene('3-text', 'three')]),
        Gene('four', 'li', [TextGene('4-text', 'four')]),
        Gene('five', 'li', [TextGene('5-text', 'five')])
      ]),
      Gene('six', 'li', [TextGene('6-text', 'six')]),
      Gene('seven-nine', 'ol', [
        Gene('seven-eight', 'ol', [
          Gene('seven', 'li', [TextGene('7-text', 'seven')]),
          Gene('eight', 'li', [TextGene('8-text', 'eight')])
        ])
      ])
    ])
  ]));

  const check = function (expected: Option<string[]>, startId: string, finishId: string) {
    const start = universe.find(universe.get(), startId).getOrDie();
    const finish = universe.find(universe.get(), finishId).getOrDie();

    const actual = Subset.subset(universe, start, finish).map((g) => Arr.map(g, (x) => x.id));
    KAssert.eqOption('eq', expected, actual);
  };

  check(Option.some(['three-five']), 'three-five', 'five');
  check(Option.some(['three-five']), 'five', 'three-five');
  check(Option.some(['two', 'three-five']), 'two', 'five');
  check(Option.some(['two', 'three-five']), 'two', 'four');
  check(Option.some(['two', 'three-five', 'six', 'seven-nine']), 'two', 'eight');
});
