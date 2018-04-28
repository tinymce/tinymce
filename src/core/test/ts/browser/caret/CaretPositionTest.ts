import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Env from 'tinymce/core/api/Env';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import CaretAsserts from '../../module/test/CaretAsserts';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.CaretPositionTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const createRange = CaretAsserts.createRange;
  const viewBlock = ViewBlock();

  if (!Env.ceFalse) {
    return;
  }

  const getRoot = function () {
    return viewBlock.get();
  };

  const setupHtml = function (html) {
    viewBlock.update(html);
  };

  suite.test('Constructor', function () {
    setupHtml('abc');
    LegacyUnit.equalDom(CaretPosition(getRoot(), 0).container(), getRoot());
    LegacyUnit.strictEqual(CaretPosition(getRoot(), 1).offset(), 1);
    LegacyUnit.equalDom(CaretPosition(getRoot().firstChild, 0).container(), getRoot().firstChild);
    LegacyUnit.strictEqual(CaretPosition(getRoot().firstChild, 1).offset(), 1);
  });

  suite.test('fromRangeStart', function () {
    setupHtml('abc');
    CaretAsserts.assertCaretPosition(CaretPosition.fromRangeStart(createRange(getRoot(), 0)), CaretPosition(getRoot(), 0));
    CaretAsserts.assertCaretPosition(CaretPosition.fromRangeStart(createRange(getRoot(), 1)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(
      CaretPosition.fromRangeStart(createRange(getRoot().firstChild, 1)),
      CaretPosition(getRoot().firstChild, 1)
    );
  });

  suite.test('fromRangeEnd', function () {
    setupHtml('abc');
    CaretAsserts.assertCaretPosition(
      CaretPosition.fromRangeEnd(createRange(getRoot(), 0, getRoot(), 1)),
      CaretPosition(getRoot(), 1)
    );
    CaretAsserts.assertCaretPosition(
      CaretPosition.fromRangeEnd(createRange(getRoot().firstChild, 0, getRoot().firstChild, 1)),
      CaretPosition(getRoot().firstChild, 1)
    );
  });

  suite.test('after', function () {
    setupHtml('abc<b>123</b>');
    CaretAsserts.assertCaretPosition(CaretPosition.after(getRoot().firstChild), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(CaretPosition.after(getRoot().lastChild), CaretPosition(getRoot(), 2));
  });

  suite.test('before', function () {
    setupHtml('abc<b>123</b>');
    CaretAsserts.assertCaretPosition(CaretPosition.before(getRoot().firstChild), CaretPosition(getRoot(), 0));
    CaretAsserts.assertCaretPosition(CaretPosition.before(getRoot().lastChild), CaretPosition(getRoot(), 1));
  });

  suite.test('isAtStart', function () {
    setupHtml('abc<b>123</b>123');
    LegacyUnit.equal(CaretPosition(getRoot(), 0).isAtStart(), true);
    LegacyUnit.equal(!CaretPosition(getRoot(), 1).isAtStart(), true);
    LegacyUnit.equal(!CaretPosition(getRoot(), 3).isAtStart(), true);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 0).isAtStart(), true);
    LegacyUnit.equal(!CaretPosition(getRoot().firstChild, 1).isAtStart(), true);
    LegacyUnit.equal(!CaretPosition(getRoot().firstChild, 3).isAtStart(), true);
  });

  suite.test('isAtEnd', function () {
    setupHtml('abc<b>123</b>123');
    LegacyUnit.equal(CaretPosition(getRoot(), 3).isAtEnd(), true);
    LegacyUnit.equal(!CaretPosition(getRoot(), 2).isAtEnd(), true);
    LegacyUnit.equal(!CaretPosition(getRoot(), 0).isAtEnd(), true);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 3).isAtEnd(), true);
    LegacyUnit.equal(!CaretPosition(getRoot().firstChild, 0).isAtEnd(), true);
    LegacyUnit.equal(!CaretPosition(getRoot().firstChild, 1).isAtEnd(), true);
  });

  suite.test('toRange', function () {
    setupHtml('abc');
    CaretAsserts.assertRange(CaretPosition(getRoot(), 0).toRange(), createRange(getRoot(), 0));
    CaretAsserts.assertRange(CaretPosition(getRoot(), 1).toRange(), createRange(getRoot(), 1));
    CaretAsserts.assertRange(CaretPosition(getRoot().firstChild, 1).toRange(), createRange(getRoot().firstChild, 1));
  });

  suite.test('isEqual', function () {
    setupHtml('abc');
    LegacyUnit.equal(CaretPosition(getRoot(), 0).isEqual(CaretPosition(getRoot(), 0)), true);
    LegacyUnit.equal(CaretPosition(getRoot(), 1).isEqual(CaretPosition(getRoot(), 0)), false);
    LegacyUnit.equal(CaretPosition(getRoot(), 0).isEqual(CaretPosition(getRoot().firstChild, 0)), false);
  });

  suite.test('isVisible', function () {
    setupHtml('<b>  abc</b>');
    LegacyUnit.equal(CaretPosition(getRoot().firstChild.firstChild, 0).isVisible(), false);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild.firstChild, 3).isVisible(), true);
  });

  suite.test('getClientRects', function () {
    setupHtml(
      '<b>abc</b>' +
      '<div contentEditable="false">1</div>' +
      '<div contentEditable="false">2</div>' +
      '<div contentEditable="false">2</div>' +
      '<input style="margin: 10px">' +
      '<input style="margin: 10px">' +
      '<input style="margin: 10px">' +
      '<p>123</p>' +
      '<br>'
    );

    LegacyUnit.equal(CaretPosition(getRoot().firstChild.firstChild, 0).getClientRects().length, 1);
    LegacyUnit.equal(CaretPosition(getRoot(), 1).getClientRects().length, 1);
    LegacyUnit.equal(CaretPosition(getRoot(), 2).getClientRects().length, 2);
    LegacyUnit.equal(CaretPosition(getRoot(), 3).getClientRects().length, 2);
    LegacyUnit.equal(CaretPosition(getRoot(), 4).getClientRects().length, 2);
    LegacyUnit.equal(CaretPosition(getRoot(), 5).getClientRects().length, 1);
    LegacyUnit.equal(CaretPosition(getRoot(), 6).getClientRects().length, 1);
    LegacyUnit.equal(CaretPosition(getRoot(), 7).getClientRects().length, 1);
    LegacyUnit.equal(CaretPosition(getRoot(), 8).getClientRects().length, 1);
    LegacyUnit.equal(CaretPosition(getRoot(), 9).getClientRects().length, 0);
  });

  suite.test('getClientRects between inline node and cE=false', function () {
    setupHtml(
      '<span contentEditable="false">def</span>' +
      '<b>ghi</b>'
    );

    LegacyUnit.equal(CaretPosition(getRoot(), 1).getClientRects().length, 1);
  });

  suite.test('getClientRects at last visible character', function () {
    setupHtml('<b>a  </b>');

    LegacyUnit.equal(CaretPosition(getRoot().firstChild.firstChild, 1).getClientRects().length, 1);
  });

  suite.test('getClientRects at extending character', function () {
    setupHtml('a');
    const textNode = getRoot().firstChild as Text;
    textNode.appendData('\u0301b');

    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 0).getClientRects().length, 1);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 1).getClientRects().length, 0);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 2).getClientRects().length, 1);
  });

  suite.test('getClientRects at whitespace character', function () {
    setupHtml('  a  ');

    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 0).getClientRects().length, 0);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 1).getClientRects().length, 0);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 2).getClientRects().length, 1);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 3).getClientRects().length, 1);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 4).getClientRects().length, 0);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild, 5).getClientRects().length, 0);
  });

  suite.test('getClientRects at only one text node should return client rects', function () {
    setupHtml('<p>a<br>b</p>');
    LegacyUnit.equal(CaretPosition(getRoot().firstChild.firstChild, 0).getClientRects().length > 0, true);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild.firstChild, 1).getClientRects().length > 0, true);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild.lastChild, 0).getClientRects().length > 0, true);
    LegacyUnit.equal(CaretPosition(getRoot().firstChild.lastChild, 1).getClientRects().length > 0, true);
  });

  suite.test('getNode', function () {
    setupHtml('<b>abc</b><input><input>');

    LegacyUnit.equalDom(CaretPosition(getRoot().firstChild.firstChild, 0).getNode(), getRoot().firstChild.firstChild);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 1).getNode(), getRoot().childNodes[1]);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 2).getNode(), getRoot().childNodes[2]);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 3).getNode(), getRoot().childNodes[2]);
  });

  suite.test('getNode (before)', function () {
    setupHtml('<b>abc</b><input><input>');

    LegacyUnit.equalDom(CaretPosition(getRoot().firstChild.firstChild, 0).getNode(true), getRoot().firstChild.firstChild);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 1).getNode(true), getRoot().childNodes[0]);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 2).getNode(true), getRoot().childNodes[1]);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 3).getNode(true), getRoot().childNodes[2]);
  });

  suite.test('isAtStart/isAtEnd/isTextPosition', function () {
    setupHtml('<b>abc</b><p><input></p>');

    LegacyUnit.equal(CaretPosition.isAtStart(CaretPosition(getRoot().firstChild.firstChild, 0)), true);
    LegacyUnit.equal(CaretPosition.isAtStart(CaretPosition(getRoot().firstChild.firstChild, 1)), false);
    LegacyUnit.equal(CaretPosition.isAtStart(CaretPosition(getRoot().firstChild.firstChild, 3)), false);
    LegacyUnit.equal(CaretPosition.isAtStart(CaretPosition(getRoot().lastChild, 0)), true);
    LegacyUnit.equal(CaretPosition.isAtStart(CaretPosition(getRoot().lastChild, 1)), false);
    LegacyUnit.equal(CaretPosition.isAtEnd(CaretPosition(getRoot().firstChild.firstChild, 3)), true);
    LegacyUnit.equal(CaretPosition.isAtEnd(CaretPosition(getRoot().firstChild.firstChild, 1)), false);
    LegacyUnit.equal(CaretPosition.isAtEnd(CaretPosition(getRoot().firstChild.firstChild, 0)), false);
    LegacyUnit.equal(CaretPosition.isAtEnd(CaretPosition(getRoot().lastChild, 1)), true);
    LegacyUnit.equal(CaretPosition.isAtEnd(CaretPosition(getRoot().lastChild, 0)), false);
    LegacyUnit.equal(CaretPosition.isTextPosition(CaretPosition(getRoot().firstChild.firstChild, 0)), true);
    LegacyUnit.equal(CaretPosition.isTextPosition(CaretPosition(getRoot().lastChild, 0)), false);
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), function () {
    viewBlock.detach();
    success();
  }, failure);
});
