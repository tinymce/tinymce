import { UnitTest, assert } from '@ephox/bedrock';
import { Page } from '../module/ephox/phoenix/test/Page';
import { Arr, Fun } from '@ephox/katamari';
import { Compare, Element, Text } from '@ephox/sugar';
import * as DomExtract from 'ephox/phoenix/api/dom/DomExtract';

UnitTest.test('DomExtractTest', function () {

  // IMPORTANT: Otherwise CSS display does not work.
  const page = Page();

  const optimise = Fun.constant(false);


  (function () {
    // Test extractTo
    const check = function (eNode: Element, eOffset: number, cNode: Element, cOffset: number, predicate: (e: Element) => boolean) {
      const actual = DomExtract.extractTo(cNode, cOffset, predicate, optimise);
      assert.eq(true, Compare.eq(eNode, actual.element()));
      assert.eq(eOffset, actual.offset());
    };

    check(page.div1, 'First paragraphSecond here'.length + 1, page.t4, 1, function (element) {
      return Compare.eq(element, page.div1);
    });
  })();


  (function () {
    // Test find.
    const check = function (eNode: Element, eOffset: number, pNode: Element, pOffset: number) {
      const actual = DomExtract.find(pNode, pOffset, optimise).getOrDie();
      assert.eq(true, Compare.eq(eNode, actual.element()));
      assert.eq(eOffset, actual.offset());
    };

    const checkNone = function (pNode: Element, pOffset: number) {
      assert.eq(true, DomExtract.find(pNode, pOffset, optimise).isNone());
    };

    check(page.t1, 1, page.p1, 1);
    check(page.t1, 5, page.p1, 5);
    check(page.t4, 1, page.p2, 12);
    check(page.t5, 1, page.p2, 16);

    checkNone(page.p1, 16);
  })();

  (function () {
    // Test extract
    const check = function (eNode: Element, eOffset: number, cNode: Element, cOffset: number) {
      const actual = DomExtract.extract(cNode, cOffset, optimise);
      assert.eq(true, Compare.eq(eNode, actual.element()));
      assert.eq(eOffset, actual.offset());
    };

    check(page.p1, 1, page.t1, 1);
    check(page.p1, 5, page.t1, 5);
    check(page.s2, 1, page.t4, 1);
    check(page.s3, 0, page.t5, 0);
  })();

  (function () {
    // Test from
    const check = function (expected: string, input: Element) {
      const rawActual = DomExtract.from(input, optimise);
      const actual = Arr.map(rawActual, function (x) {
        return x.fold(function () {
          return '\\w';
        }, function () {
          return '-';
        }, function (t) {
          return Text.get(t);
        });
      }).join('');
      assert.eq(expected, actual);
    };

    check('', Element.fromText(''));
    check('\\wFirst paragraph\\w', page.p1);
    check('\\w\\wFirst paragraph\\w\\wSecond here is something\\w\\wMore data\\w\\w', page.div1);
    check('\\w\\w\\wFirst paragraph\\w\\wSecond here is something\\w\\wMore data\\w\\w\\wNext \\wSection now\\w\\w\\w', page.container);
  })();

  page.disconnect();
});