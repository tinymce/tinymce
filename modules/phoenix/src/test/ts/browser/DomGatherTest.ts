import { assert, UnitTest } from '@ephox/bedrock';
import { Arr, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as DomGather from 'ephox/phoenix/api/dom/DomGather';
import { Page } from '../module/ephox/phoenix/test/Page';

UnitTest.test('DomGatherTest', function () {
  const page = Page();

  const is = function (x: Element) {
    return function (e: Element) {
      return e.dom() === x.dom();
    };
  };

  interface CheckItem {
    seek: (element: Element, predicate: (e: Element) => boolean, isRoot: (e: Element) => boolean) => Option<Element>;
    element: Element;
    predicate: (e: Element) => boolean;
    expected: Element;
  }

  const check = function (spec: CheckItem) {
    const actual = spec.seek(spec.element, spec.predicate, is(page.container)).getOrDie('No actual element found.');
    assert.eq(spec.expected.dom(), actual.dom());
  };

  const cases: CheckItem[] = [
    {
      seek: DomGather.seekLeft,
      element: page.p2,
      predicate: is(page.p1),
      expected: page.p1
    },
    {
      seek: DomGather.seekRight,
      element: page.p1,
      predicate: is(page.p2),
      expected: page.p2
    }
  ];

  page.connect();
  Arr.map(cases, check);
  page.disconnect();
});