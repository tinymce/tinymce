import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';

import * as Clumps from 'ephox/robin/clumps/Clumps';

UnitTest.test('ClumpsTest', () => {
  const doc = TestUniverse(Gene('root', 'root', [
    Gene('p1', 'p', [
      Gene('aa', 'span', [
        TextGene('aaa', 'aaa'),
        TextGene('aab', 'aab'),
        TextGene('aac', 'aac')
      ])
    ])
  ]));

  const isRoot = (item: Gene) => {
    return item.name === 'root';
  };

  interface RawRange {
    start: string;
    soffset: number;
    finish: string;
    foffset: number;
  }

  // const collect = function <E, D> (universe: Universe<E, D>, isRoot, start, soffset, finish, foffset)
  const check = (expected: RawRange[], startId: string, soffset: number, finishId: string, foffset: number) => {
    const start = doc.find(doc.get(), startId).getOrDie();
    const finish = doc.find(doc.get(), finishId).getOrDie();
    const rawActual = Clumps.collect(doc, isRoot, start, soffset, finish, foffset);

    const actual = Arr.map(rawActual, (a): RawRange => {
      return { start: a.start.id, soffset: a.soffset, finish: a.finish.id, foffset: a.foffset };
    });

    Assert.eq('', expected, actual);
  };

  check([
    { start: 'aaa', soffset: 0, finish: 'aac', foffset: 'aac'.length }
  ], 'p1', 0, 'p1', 1);
});
