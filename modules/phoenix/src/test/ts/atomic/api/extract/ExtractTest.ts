import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';

import * as Extract from 'ephox/phoenix/api/general/Extract';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';

UnitTest.test('api.Extract.(from,all,extract,extractTo)', () => {
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

  const check = (expected: string[], extract: typeof Extract.from, initial: string) => {
    const start = Finder.get(doc, initial);
    const actual = extract(doc, start);
    Assert.eq('', expected, Arr.map(actual, TestRenders.typeditem));
  };

  const checkFrom = (expected: string[], initial: string) => {
    check(expected, Extract.from, initial);
  };

  const checkAll = (expected: string[], initial: string) => {
    const start = Finder.get(doc, initial);
    const actual = Extract.all(doc, start);
    Assert.eq('', expected, Arr.map(actual, (a) => {
      return a.id;
    }));
  };

  //
  // const extract = (universe, child, offset) => {
  const checkExtract = (expected: { id: string; offset: number }, childId: string, offset: number) => {
    const child = Finder.get(doc, childId);
    const actual = Extract.extract(doc, child, offset);
    Assert.eq('', expected.id, actual.element.id);
    Assert.eq('', expected.offset, actual.offset);
  };

  const checkExtractTo = (expected: { id: string; offset: number }, childId: string, offset: number, pred: (e: any) => boolean) => {
    const child = Finder.get(doc, childId);
    const actual = Extract.extractTo(doc, child, offset, pred);
    Assert.eq('', expected.id, actual.element.id);
    Assert.eq('', expected.offset, actual.offset);
  };

  checkFrom([
    'boundary(1)',
    'boundary(1.1)',
    'empty(1.1.1)',
    'text("post-image text")',
    'boundary(1.1)',
    'boundary(1.2)',
    'text("This is text")',
    'text("inside a span")',
    'text("More text")',
    'text("Inside em")',
    'text("Last piece of text")',
    'boundary(1.2)',
    'boundary(1)'
  ], 'root');

  checkAll([
    '1', '1.1', '1.1.1', '1.1.2', '1.1', '1.2', '1.2.1', '1.2.2.1',
    '1.2.3', '1.2.4.1', '1.2.5', '1.2', '1'
  ], 'root');

  checkExtract({ id: '1.2', offset: 3 }, '1.2.1', 3);
  checkExtract({ id: '1.2', offset: 'This is textinside a span'.length }, '1.2.3', 0);
  checkExtract({
    id: '1.2',
    offset: 'This is textinside a spanMore textInside em'.length
  }, '1.2.5', 0);
  checkExtract({ id: '1.1', offset: 1 }, '1.1.2', 0);

  checkExtractTo({ id: '1.2', offset: 'This is textinside a spanMore text'.length + 2 }, '1.2.4.1', 2, (item) => {
    return item.name === 'p';
  });
});
