import { UnitTest, assert } from '@ephox/bedrock';
import { Page } from '../module/ephox/phoenix/test/Page';
import { Arr, Fun } from '@ephox/katamari';
import { Compare, Element, Text } from '@ephox/sugar';
import * as DomExtract from 'ephox/phoenix/api/dom/DomExtract';

UnitTest.test('DomExtractTest', function () {

  // IMPORTANT: Otherwise CSS display does not work.
  var page = Page();

  var optimise = Fun.constant(false);


  (function () {
    // Test extractTo
    var check = function (eNode, eOffset, cNode, cOffset, predicate) {
      var actual = DomExtract.extractTo(cNode, cOffset, predicate, optimise);
      assert.eq(true, Compare.eq(eNode, actual.element()));
      assert.eq(eOffset, actual.offset());
    };

    check(page.div1, 'First paragraphSecond here'.length + 1, page.t4, 1, function (element) {
      return Compare.eq(element, page.div1);
    });
  })();


  (function () {
    // Test find.
    var check = function (eNode, eOffset, pNode, pOffset) {
      var actual = DomExtract.find(pNode, pOffset, optimise).getOrDie();
      assert.eq(true, Compare.eq(eNode, actual.element()));
      assert.eq(eOffset, actual.offset());
    };

    var checkNone = function (pNode, pOffset) {
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
    var check = function (eNode, eOffset, cNode, cOffset) {
      var actual = DomExtract.extract(cNode, cOffset, optimise);
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
    var check = function (expected, input) {
      var rawActual = DomExtract.from(input, optimise);
      var actual = Arr.map(rawActual, function (x) {
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