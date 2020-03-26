import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Element, Text, Traverse } from '@ephox/sugar';
import * as DomSplit from 'ephox/phoenix/api/dom/DomSplit';
import { Page } from '../module/ephox/phoenix/test/Page';
import { Text as DomText } from '@ephox/dom-globals';

UnitTest.test('DomSplitTest', function () {
  /*
      <container><div1><p1>{t1:First paragraph}<p2>{t2:Second }<s1>{t3:here}<s2>{t4: is }<s3>{t5:something}
  <p3>{t6:More data}
  <div2>{t7:Next }<p4>{t8:Section }<s4>{t9:no}{t10:w}
  */

  const check = function (expected: string[], element: Element<DomText>) {
    const parent = Traverse.parent(element);
    parent.fold(function () {
      throw new Error('Element must have parent for test to work');
    }, function (v) {
      const children = Traverse.children(v) as Element<DomText>[];
      const text = Arr.map(children, Text.get);
      assert.eq(expected, text);
    });
  };

  const checkSplitByPair = function (expected: string[], element: Element<DomText>, start: number, end: number) {
    DomSplit.splitByPair(element, start, end);
    check(expected, element);
  };

  const checkSplit = function (expected: string[], element: Element<DomText>, offset: number) {
    DomSplit.split(element, offset);
    check(expected, element);
  };

  checkSplit([ 'no', 'w' ], Page().t9, 2);
  checkSplit([ 'no', 'w' ], Page().t9, 0);
  checkSplit([ 'n', 'o', 'w' ], Page().t9, 1);
  checkSplit([ 'no', 'w' ], Page().t10, 0);
  checkSplit([ 'no', 'w' ], Page().t10, 1);

  checkSplitByPair([ 'something' ], Page().t5, 0, 9);
  checkSplitByPair([ 'something' ], Page().t5, 0, 0);
  checkSplitByPair([ 'something' ], Page().t5, 9, 9);
  checkSplitByPair([ 's', 'omething' ], Page().t5, 0, 1);
  checkSplitByPair([ 'some', 'thing' ], Page().t5, 0, 4);
  checkSplitByPair([ 'some', 'thing' ], Page().t5, 4, 9);
  checkSplitByPair([ 's', 'omet', 'hing' ], Page().t5, 1, 5);
});
