import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';
import * as Contiguous from 'ephox/phoenix/util/Contiguous';

UnitTest.test('Contiguous Text Nodes Test', function () {
  const doc = TestUniverse(
    Gene('root', 'root', [
      Gene('1', 'span', [
        TextGene('1.1', 'alpha'),
        TextGene('1.2', 'beta'),
        TextGene('1.3', 'gamma')
      ]),
      Gene('2', 'span', [
        TextGene('1.4', '')
      ]),
      Gene('3', 'span', [
        TextGene('1.5', ''),
        Gene('img', 'img'),
        TextGene('1.6', '')
      ])
    ])
  );

  interface CheckItem {
    parent: string;
    children: string[];
  }

  const check = function (expected: CheckItem[], ids: string[]) {
    const actual = Contiguous.textnodes(doc, Finder.getAll(doc, ids));
    assert.eq(expected.length, actual.length);
    Arr.each(expected, function (exp, i) {
      const act = actual[i];
      assert.eq(exp.parent, act.parent.id);
      assert.eq(exp.children, TestRenders.ids(act.children));
    });
  };

  check([
    { parent: '1', children: ['1.1', '1.2', '1.3'] }
  ], ['1.1', '1.2', '1.3']);

  check([
    { parent: '1', children: ['1.1', '1.2', '1.3'] },
    { parent: '2', children: ['1.4'] },
    { parent: '3', children: ['1.5'] },
    { parent: '3', children: ['1.6'] }
  ], ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6']);
});

