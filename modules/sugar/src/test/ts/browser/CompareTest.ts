import * as Compare from 'ephox/sugar/api/dom/Compare';
import Element from 'ephox/sugar/api/node/Element';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import TestPage from 'ephox/sugar/test/TestPage';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('CompareTest', function () {
  TestPage.connect(); // description of structure is in TestPage

  const check = function (expected, e1, e2) {
    assert.eq(expected, Compare.eq(e1, e2));
  };

  check(true, TestPage.p1, TestPage.p1);
  check(false, TestPage.p1, TestPage.p2);
  check(true, TestPage.s1, TestPage.s1);
  check(false, TestPage.s1, TestPage.s2);

  assert.eq(false, Compare.member(TestPage.p1, []));
  assert.eq(true, Compare.member(TestPage.p1, [TestPage.p1]));
  assert.eq(true, Compare.member(TestPage.p1, [TestPage.t2, TestPage.p1]));
  assert.eq(false, Compare.member(TestPage.p1, [TestPage.t2]));

  const checkIsEqualNode = function (expected, e1, e2) {
    assert.eq(expected, Compare.isEqualNode(e1, e2));
  };

  checkIsEqualNode(true, Element.fromTag('p'), Element.fromTag('p'));
  checkIsEqualNode(false, Element.fromTag('p'), Element.fromTag('span'));
  // Tests for compareDocumentPosition() that returns the raw bitmask were added and checked working 31/8/16
  // They are commented out since if we expose this method in future it would return some sort of 'case type'
  // not the raw bitmask.

  // // Mask components: https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
  // // Name                             Value
  // // DOCUMENT_POSITION_DISCONNECTED   1
  // // DOCUMENT_POSITION_PRECEDING      2
  // // DOCUMENT_POSITION_FOLLOWING      4
  // // DOCUMENT_POSITION_CONTAINS       8
  // // DOCUMENT_POSITION_CONTAINED_BY  16
  // // DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC   32

  // // Text Node vs Element
  // checkMask(Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY,
  //   TestPage.container, TestPage.t6);
  // checkMask(Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS,
  //   TestPage.t6, TestPage.container);
  // checkMask(Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY,
  //   TestPage.p3, TestPage.t6); // t6 following and contained-by p3
  // checkMask(Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS,
  //   TestPage.t6, TestPage.p3); // p3 preceding and contains t6
  // checkMask(Node.DOCUMENT_POSITION_FOLLOWING,
  //   TestPage.t1, TestPage.s2);
  // checkMask(Node.DOCUMENT_POSITION_PRECEDING,
  //   TestPage.s2, TestPage.t1);
  // // Text Node vs Text Node
  // checkMask(Node.DOCUMENT_POSITION_FOLLOWING,
  //   TestPage.t7, TestPage.t6); // t6 following t7
  // checkMask(Node.DOCUMENT_POSITION_PRECEDING,
  //   TestPage.t6, TestPage.t7);
  // checkMask(Node.DOCUMENT_POSITION_FOLLOWING,
  //   TestPage.t1, TestPage.t7);
  // checkMask(Node.DOCUMENT_POSITION_PRECEDING,
  //   TestPage.t7, TestPage.t1);
  // // Element vs Element
  // checkMask(Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY,
  //   TestPage.container, TestPage.d1);
  // checkMask(Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS,
  //   TestPage.d1, TestPage.container);
  // checkMask(Node.DOCUMENT_POSITION_FOLLOWING,
  //   TestPage.p1, TestPage.s2);
  // checkMask(Node.DOCUMENT_POSITION_PRECEDING,
  //   TestPage.s2, TestPage.p1);

  // Text Node vs Element
  assert.eq(true,  Compare.contains(TestPage.container, TestPage.t6));
  assert.eq(false, Compare.contains(TestPage.t6, TestPage.container));
  assert.eq(true,  Compare.contains(TestPage.p3, TestPage.t6));
  assert.eq(false, Compare.contains(TestPage.t6, TestPage.p3));
  assert.eq(false, Compare.contains(TestPage.t1, TestPage.s2));
  assert.eq(false, Compare.contains(TestPage.s2, TestPage.t1));
  // Text Node vs Text Node
  assert.eq(false, Compare.contains(TestPage.t7, TestPage.t6));
  assert.eq(false, Compare.contains(TestPage.t6, TestPage.t7));
  assert.eq(false, Compare.contains(TestPage.t6, TestPage.t6)); // does not contain itself
  // Element vs Element
  assert.eq(true,  Compare.contains(TestPage.container, TestPage.d1));
  assert.eq(false, Compare.contains(TestPage.d1, TestPage.container));
  assert.eq(false, Compare.contains(TestPage.p1, TestPage.s2));
  assert.eq(false, Compare.contains(TestPage.s2, TestPage.p1));
  assert.eq(false, Compare.contains(TestPage.s2, TestPage.s2)); // does not contain itself

  // Clean up test page
  Remove.remove(TestPage.container);
});
