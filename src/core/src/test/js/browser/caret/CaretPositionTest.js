asynctest(
  'browser.tinymce.core.CaretPositionTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.Env',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.test.CaretAsserts',
    'tinymce.core.test.ViewBlock'
  ],
  function (LegacyUnit, Pipeline, DOMUtils, Env, CaretPosition, CaretAsserts, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var createRange = CaretAsserts.createRange;
    var viewBlock = new ViewBlock();

    if (!Env.ceFalse) {
      return;
    }

    var getRoot = function () {
      return viewBlock.get();
    };

    var setupHtml = function (html) {
      viewBlock.update(html);
    };

    suite.test('Constructor', function () {
      setupHtml('abc');
      LegacyUnit.equalDom(new CaretPosition(getRoot(), 0).container(), getRoot());
      LegacyUnit.strictEqual(new CaretPosition(getRoot(), 1).offset(), 1);
      LegacyUnit.equalDom(new CaretPosition(getRoot().firstChild, 0).container(), getRoot().firstChild);
      LegacyUnit.strictEqual(new CaretPosition(getRoot().firstChild, 1).offset(), 1);
    });

    suite.test('fromRangeStart', function () {
      setupHtml('abc');
      CaretAsserts.assertCaretPosition(CaretPosition.fromRangeStart(createRange(getRoot(), 0)), new CaretPosition(getRoot(), 0));
      CaretAsserts.assertCaretPosition(CaretPosition.fromRangeStart(createRange(getRoot(), 1)), new CaretPosition(getRoot(), 1));
      CaretAsserts.assertCaretPosition(
        CaretPosition.fromRangeStart(createRange(getRoot().firstChild, 1)),
        new CaretPosition(getRoot().firstChild, 1)
      );
    });

    suite.test('fromRangeEnd', function () {
      setupHtml('abc');
      CaretAsserts.assertCaretPosition(
        CaretPosition.fromRangeEnd(createRange(getRoot(), 0, getRoot(), 1)),
        new CaretPosition(getRoot(), 1)
      );
      CaretAsserts.assertCaretPosition(
        CaretPosition.fromRangeEnd(createRange(getRoot().firstChild, 0, getRoot().firstChild, 1)),
        new CaretPosition(getRoot().firstChild, 1)
      );
    });

    suite.test('after', function () {
      setupHtml('abc<b>123</b>');
      CaretAsserts.assertCaretPosition(CaretPosition.after(getRoot().firstChild), new CaretPosition(getRoot(), 1));
      CaretAsserts.assertCaretPosition(CaretPosition.after(getRoot().lastChild), new CaretPosition(getRoot(), 2));
    });

    suite.test('before', function () {
      setupHtml('abc<b>123</b>');
      CaretAsserts.assertCaretPosition(CaretPosition.before(getRoot().firstChild), new CaretPosition(getRoot(), 0));
      CaretAsserts.assertCaretPosition(CaretPosition.before(getRoot().lastChild), new CaretPosition(getRoot(), 1));
    });

    suite.test('isAtStart', function () {
      setupHtml('abc<b>123</b>123');
      LegacyUnit.equal(new CaretPosition(getRoot(), 0).isAtStart(), true);
      LegacyUnit.equal(!new CaretPosition(getRoot(), 1).isAtStart(), true);
      LegacyUnit.equal(!new CaretPosition(getRoot(), 3).isAtStart(), true);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 0).isAtStart(), true);
      LegacyUnit.equal(!new CaretPosition(getRoot().firstChild, 1).isAtStart(), true);
      LegacyUnit.equal(!new CaretPosition(getRoot().firstChild, 3).isAtStart(), true);
    });

    suite.test('isAtEnd', function () {
      setupHtml('abc<b>123</b>123');
      LegacyUnit.equal(new CaretPosition(getRoot(), 3).isAtEnd(), true);
      LegacyUnit.equal(!new CaretPosition(getRoot(), 2).isAtEnd(), true);
      LegacyUnit.equal(!new CaretPosition(getRoot(), 0).isAtEnd(), true);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 3).isAtEnd(), true);
      LegacyUnit.equal(!new CaretPosition(getRoot().firstChild, 0).isAtEnd(), true);
      LegacyUnit.equal(!new CaretPosition(getRoot().firstChild, 1).isAtEnd(), true);
    });

    suite.test('toRange', function () {
      setupHtml('abc');
      CaretAsserts.assertRange(new CaretPosition(getRoot(), 0).toRange(), createRange(getRoot(), 0));
      CaretAsserts.assertRange(new CaretPosition(getRoot(), 1).toRange(), createRange(getRoot(), 1));
      CaretAsserts.assertRange(new CaretPosition(getRoot().firstChild, 1).toRange(), createRange(getRoot().firstChild, 1));
    });

    suite.test('isEqual', function () {
      setupHtml('abc');
      LegacyUnit.equal(new CaretPosition(getRoot(), 0).isEqual(new CaretPosition(getRoot(), 0)), true);
      LegacyUnit.equal(new CaretPosition(getRoot(), 1).isEqual(new CaretPosition(getRoot(), 0)), false);
      LegacyUnit.equal(new CaretPosition(getRoot(), 0).isEqual(new CaretPosition(getRoot().firstChild, 0)), false);
    });

    suite.test('isVisible', function () {
      setupHtml('<b>  abc</b>');
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild.firstChild, 0).isVisible(), false);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild.firstChild, 3).isVisible(), true);
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

      LegacyUnit.equal(new CaretPosition(getRoot().firstChild.firstChild, 0).getClientRects().length, 1);
      LegacyUnit.equal(new CaretPosition(getRoot(), 1).getClientRects().length, 1);
      LegacyUnit.equal(new CaretPosition(getRoot(), 2).getClientRects().length, 2);
      LegacyUnit.equal(new CaretPosition(getRoot(), 3).getClientRects().length, 2);
      LegacyUnit.equal(new CaretPosition(getRoot(), 4).getClientRects().length, 2);
      LegacyUnit.equal(new CaretPosition(getRoot(), 5).getClientRects().length, 1);
      LegacyUnit.equal(new CaretPosition(getRoot(), 6).getClientRects().length, 1);
      LegacyUnit.equal(new CaretPosition(getRoot(), 7).getClientRects().length, 1);
      LegacyUnit.equal(new CaretPosition(getRoot(), 8).getClientRects().length, 1);
      LegacyUnit.equal(new CaretPosition(getRoot(), 9).getClientRects().length, 0);
    });

    suite.test('getClientRects between inline node and cE=false', function () {
      setupHtml(
        '<span contentEditable="false">def</span>' +
        '<b>ghi</b>'
      );

      LegacyUnit.equal(new CaretPosition(getRoot(), 1).getClientRects().length, 1);
    });

    suite.test('getClientRects at last visible character', function () {
      setupHtml('<b>a  </b>');

      LegacyUnit.equal(new CaretPosition(getRoot().firstChild.firstChild, 1).getClientRects().length, 1);
    });

    suite.test('getClientRects at extending character', function () {
      setupHtml('a');
      getRoot().firstChild.appendData('\u0301b');

      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 0).getClientRects().length, 1);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 1).getClientRects().length, 0);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 2).getClientRects().length, 1);
    });

    suite.test('getClientRects at whitespace character', function () {
      setupHtml('  a  ');

      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 0).getClientRects().length, 0);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 1).getClientRects().length, 0);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 2).getClientRects().length, 1);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 3).getClientRects().length, 1);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 4).getClientRects().length, 0);
      LegacyUnit.equal(new CaretPosition(getRoot().firstChild, 5).getClientRects().length, 0);
    });

    suite.test('getNode', function () {
      setupHtml('<b>abc</b><input><input>');

      LegacyUnit.equalDom(new CaretPosition(getRoot().firstChild.firstChild, 0).getNode(), getRoot().firstChild.firstChild);
      LegacyUnit.equalDom(new CaretPosition(getRoot(), 1).getNode(), getRoot().childNodes[1]);
      LegacyUnit.equalDom(new CaretPosition(getRoot(), 2).getNode(), getRoot().childNodes[2]);
      LegacyUnit.equalDom(new CaretPosition(getRoot(), 3).getNode(), getRoot().childNodes[2]);
    });

    suite.test('getNode (before)', function () {
      setupHtml('<b>abc</b><input><input>');

      LegacyUnit.equalDom(new CaretPosition(getRoot().firstChild.firstChild, 0).getNode(true), getRoot().firstChild.firstChild);
      LegacyUnit.equalDom(new CaretPosition(getRoot(), 1).getNode(true), getRoot().childNodes[0]);
      LegacyUnit.equalDom(new CaretPosition(getRoot(), 2).getNode(true), getRoot().childNodes[1]);
      LegacyUnit.equalDom(new CaretPosition(getRoot(), 3).getNode(true), getRoot().childNodes[2]);
    });

    suite.test('isAtStart/isAtEnd/isTextPosition', function () {
      setupHtml('<b>abc</b><p><input></p>');

      LegacyUnit.equal(CaretPosition.isAtStart(new CaretPosition(getRoot().firstChild.firstChild, 0)), true);
      LegacyUnit.equal(CaretPosition.isAtStart(new CaretPosition(getRoot().firstChild.firstChild, 1)), false);
      LegacyUnit.equal(CaretPosition.isAtStart(new CaretPosition(getRoot().firstChild.firstChild, 3)), false);
      LegacyUnit.equal(CaretPosition.isAtStart(new CaretPosition(getRoot().lastChild, 0)), true);
      LegacyUnit.equal(CaretPosition.isAtStart(new CaretPosition(getRoot().lastChild, 1)), false);
      LegacyUnit.equal(CaretPosition.isAtEnd(new CaretPosition(getRoot().firstChild.firstChild, 3)), true);
      LegacyUnit.equal(CaretPosition.isAtEnd(new CaretPosition(getRoot().firstChild.firstChild, 1)), false);
      LegacyUnit.equal(CaretPosition.isAtEnd(new CaretPosition(getRoot().firstChild.firstChild, 0)), false);
      LegacyUnit.equal(CaretPosition.isAtEnd(new CaretPosition(getRoot().lastChild, 1)), true);
      LegacyUnit.equal(CaretPosition.isAtEnd(new CaretPosition(getRoot().lastChild, 0)), false);
      LegacyUnit.equal(CaretPosition.isTextPosition(new CaretPosition(getRoot().firstChild.firstChild, 0)), true);
      LegacyUnit.equal(CaretPosition.isTextPosition(new CaretPosition(getRoot().lastChild, 0)), false);
    });

    viewBlock.attach();
    Pipeline.async({}, suite.toSteps({}), function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
