import { Assert, UnitTest } from '@ephox/bedrock-client';
import { CommentGene, Gene, TestUniverse, TextGene } from '@ephox/boss';

import * as Finder from 'ephox/phoenix/test/Finder';
import * as Navigation from 'ephox/phoenix/wrap/Navigation';

UnitTest.test('NavigationTest', () => {
  let doc = TestUniverse(
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

  interface CheckItem {
    element: string;
    offset: number;
  }

  const checkLast = (expected: CheckItem, id: string) => {
    const actual = Navigation.toLast(doc, Finder.get(doc, id));
    Assert.eq('', expected.element, actual.element.id);
    Assert.eq('', expected.offset, actual.offset);
  };

  const checkLower = (expected: CheckItem, id: string) => {
    const actual = Navigation.toLower(doc, Finder.get(doc, id));
    Assert.eq('', expected.element, actual.element.id);
    Assert.eq('', expected.offset, actual.offset);
  };

  const checkLeaf = (expected: CheckItem, id: string, offset: number) => {
    const actual = Navigation.toLeaf(doc, Finder.get(doc, id), offset);
    Assert.eq('', expected.element, actual.element.id);
    Assert.eq('', expected.offset, actual.offset);
  };

  checkLower({ element: '1', offset: 2 }, '1');
  checkLower({ element: '1.2.5', offset: 'Last piece of text'.length }, '1.2.5');

  checkLast({ element: '1.2.5', offset: 'Last piece of text'.length }, '1');
  checkLast({ element: '1.2.5', offset: 'Last piece of text'.length }, '1.2.5');

  checkLeaf({ element: '1.1.2', offset: 0 }, '1.1', 1);
  checkLeaf({ element: '1.1.2', offset: 'post-image text'.length }, '1.1', 2);
  checkLeaf({ element: '1.2.2.1', offset: 0 }, '1.2', 1);
  checkLeaf({ element: '1.2.5', offset: 'Last piece of text'.length }, '1.2', 5);

  const checkFreeFallLtr = (expected: CheckItem, universe: TestUniverse, elementId: string) => {
    const element = Finder.get(doc, elementId);
    const actual = Navigation.freefallLtr(universe, element);
    Assert.eq('', element.id, elementId);
    Assert.eq('', expected.element, actual.element.id);
    Assert.eq('', expected.offset, actual.offset);
  };

  const checkFreeFallRtl = (expected: CheckItem, universe: TestUniverse, elementId: string) => {
    const element = Finder.get(doc, elementId);
    const actual = Navigation.freefallRtl(universe, element);
    Assert.eq('', element.id, elementId);
    Assert.eq('', expected.element, actual.element.id);
    Assert.eq('', expected.offset, actual.offset);
  };

  // Freefall without comment nodes
  checkFreeFallLtr({ element: '1.1.1', offset: 0 }, doc, 'root');
  checkFreeFallLtr({ element: '1.1.1', offset: 0 }, doc, '1');
  checkFreeFallLtr({ element: '1.1.1', offset: 0 }, doc, '1.1');
  checkFreeFallLtr({ element: '1.1.1', offset: 0 }, doc, '1.1.1');
  checkFreeFallLtr({ element: '1.1.2', offset: 0 }, doc, '1.1.2');
  checkFreeFallLtr({ element: '1.2.1', offset: 0 }, doc, '1.2');
  checkFreeFallLtr({ element: '1.2.1', offset: 0 }, doc, '1.2.1');
  checkFreeFallLtr({ element: '1.2.2.1', offset: 0 }, doc, '1.2.2');
  checkFreeFallLtr({ element: '1.2.3', offset: 0 }, doc, '1.2.3');
  checkFreeFallLtr({ element: '1.2.4.1', offset: 0 }, doc, '1.2.4');
  checkFreeFallLtr({ element: '1.2.4.1', offset: 0 }, doc, '1.2.4.1');
  checkFreeFallLtr({ element: '1.2.5', offset: 0 }, doc, '1.2.5');

  checkFreeFallRtl({ element: '1.2.5', offset: 18 }, doc, 'root');
  checkFreeFallRtl({ element: '1.2.5', offset: 18 }, doc, '1');
  checkFreeFallRtl({ element: '1.1.2', offset: 15 }, doc, '1.1');
  checkFreeFallRtl({ element: '1.1.1', offset: 0 }, doc, '1.1.1');
  checkFreeFallRtl({ element: '1.1.2', offset: 15 }, doc, '1.1.2');
  checkFreeFallRtl({ element: '1.2.5', offset: 18 }, doc, '1.2');
  checkFreeFallRtl({ element: '1.2.1', offset: 12 }, doc, '1.2.1');
  checkFreeFallRtl({ element: '1.2.2.1', offset: 13 }, doc, '1.2.2');
  checkFreeFallRtl({ element: '1.2.3', offset: 9 }, doc, '1.2.3');
  checkFreeFallRtl({ element: '1.2.4.1', offset: 9 }, doc, '1.2.4');
  checkFreeFallRtl({ element: '1.2.4.1', offset: 9 }, doc, '1.2.4.1');
  checkFreeFallRtl({ element: '1.2.5', offset: 18 }, doc, '1.2.5');

  // Freefall with comment nodes: tbio-4938
  doc = TestUniverse(
    Gene('2-root', '2-root', [
      Gene('2-1', 'p', [
        TextGene('2-1.1', 'some text')
      ])
    ])
  );

  checkFreeFallLtr({ element: '2-1.1', offset: 0 }, doc, '2-root');
  checkFreeFallLtr({ element: '2-1.1', offset: 0 }, doc, '2-1');
  checkFreeFallLtr({ element: '2-1.1', offset: 0 }, doc, '2-1.1');

  checkFreeFallRtl({ element: '2-1.1', offset: 9 }, doc, '2-root');
  checkFreeFallRtl({ element: '2-1.1', offset: 9 }, doc, '2-1');
  checkFreeFallRtl({ element: '2-1.1', offset: 9 }, doc, '2-1.1');

  doc = TestUniverse(
    Gene('3-root', '3-root', [
      Gene('3-1', 'p', [
        CommentGene('3-c0', 'some comment'),
        TextGene('3-1.1', 'some text')
      ])
    ])
  );

  checkFreeFallLtr({ element: '3-1.1', offset: 0 }, doc, '3-root');
  checkFreeFallLtr({ element: '3-1.1', offset: 0 }, doc, '3-1');
  checkFreeFallLtr({ element: '3-1.1', offset: 0 }, doc, '3-c0');
  checkFreeFallLtr({ element: '3-1.1', offset: 0 }, doc, '3-1.1');

  checkFreeFallRtl({ element: '3-1.1', offset: 9 }, doc, '3-root');
  checkFreeFallRtl({ element: '3-1.1', offset: 9 }, doc, '3-1');
  checkFreeFallRtl({ element: '3-c0', offset: 0 }, doc, '3-c0');
  checkFreeFallRtl({ element: '3-1.1', offset: 9 }, doc, '3-1.1');

  doc = TestUniverse(
    Gene('4-root', '4-root', [
      CommentGene('4-c0', 'some comment'),
      Gene('4-1', 'p', [
        CommentGene('4-c1', 'some comment'),
        TextGene('4-1.1', 'some text'),
        CommentGene('4-c2', 'some comment')
      ])
    ])
  );

  checkFreeFallLtr({ element: '4-1.1', offset: 0 }, doc, '4-root');
  checkFreeFallLtr({ element: '4-1.1', offset: 0 }, doc, '4-c0');
  checkFreeFallLtr({ element: '4-1.1', offset: 0 }, doc, '4-1');
  checkFreeFallLtr({ element: '4-1.1', offset: 0 }, doc, '4-c1');
  checkFreeFallLtr({ element: '4-1.1', offset: 0 }, doc, '4-1.1');
  checkFreeFallLtr({ element: '4-c2', offset: 0 }, doc, '4-c2');

  checkFreeFallRtl({ element: '4-1.1', offset: 9 }, doc, '4-root');
  checkFreeFallRtl({ element: '4-c0', offset: 0 }, doc, '4-c0');
  checkFreeFallRtl({ element: '4-1.1', offset: 9 }, doc, '4-1');
  checkFreeFallRtl({ element: '4-c1', offset: 0 }, doc, '4-c1');
  checkFreeFallRtl({ element: '4-1.1', offset: 9 }, doc, '4-1.1');
  checkFreeFallRtl({ element: '4-1.1', offset: 9 }, doc, '4-c2');
});
