asynctest(
  'browser.tinymce.core.LineWalkerTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.Env',
    'tinymce.core.caret.LineWalker',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.DomQuery',
    'tinymce.core.test.ViewBlock'
  ],
  function (LegacyUnit, Pipeline, Env, LineWalker, CaretPosition, $, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();

    if (!Env.ceFalse) {
      return;
    }

    var getRoot = function () {
      return viewBlock.get();
    };

    suite.test('positionsUntil', function () {
      var result, predicateCallCount = 0;

      var predicate = function () {
        predicateCallCount++;
        return false;
      };

      $(getRoot()).html('<span contentEditable="false">a</span><span>b</span>');
      result = LineWalker.positionsUntil(1, getRoot(), predicate, getRoot().firstChild);
      LegacyUnit.equal(result.length, 3);
      LegacyUnit.equalDom(result[0].position.getNode(), getRoot().lastChild);
      LegacyUnit.equalDom(result[1].position.getNode(), getRoot().lastChild.firstChild);
      LegacyUnit.equalDom(result[2].position.getNode(), getRoot().lastChild.firstChild);
      LegacyUnit.equal(predicateCallCount, 3);

      predicateCallCount = 0;
      $(getRoot()).html('<span>a</span><span contentEditable="false">b</span>');
      result = LineWalker.positionsUntil(-1, getRoot(), predicate, getRoot().lastChild);
      LegacyUnit.equal(result.length, 3);
      LegacyUnit.equalDom(result[0].position.getNode(), getRoot().lastChild);
      LegacyUnit.equalDom(result[1].position.getNode(), getRoot().firstChild.firstChild);
      LegacyUnit.equalDom(result[2].position.getNode(), getRoot().firstChild.firstChild);
      LegacyUnit.equal(predicateCallCount, 3);
    });

    suite.test('upUntil', function () {
      var caretPosition, result, predicateCallCount = 0;

      var predicate = function () {
        predicateCallCount++;
        return false;
      };

      $(getRoot()).html('<p>a</p><p>b</p><p>c</p>');

      caretPosition = new CaretPosition(getRoot().lastChild.lastChild, 1);
      result = LineWalker.upUntil(getRoot(), predicate, caretPosition);

      LegacyUnit.equal(result.length, 3);
      LegacyUnit.equal(result[0].line, 0);
      LegacyUnit.equal(result[1].line, 1);
      LegacyUnit.equal(result[2].line, 2);
      LegacyUnit.equal(predicateCallCount, 3);
    });

    suite.test('downUntil', function () {
      var caretPosition, result, predicateCallCount = 0;

      var predicate = function () {
        predicateCallCount++;
        return false;
      };

      $(getRoot()).html('<p>a</p><p>b</p><p>c</p>');

      caretPosition = new CaretPosition(getRoot().firstChild.firstChild, 0);
      result = LineWalker.downUntil(getRoot(), predicate, caretPosition);

      LegacyUnit.equal(result.length, 3);
      LegacyUnit.equal(result[0].line, 0);
      LegacyUnit.equal(result[1].line, 1);
      LegacyUnit.equal(result[2].line, 2);
      LegacyUnit.equal(predicateCallCount, 3);
    });

    suite.test('isAboveLine', function () {
      LegacyUnit.equal(LineWalker.isAboveLine(5)({ line: 10 }), true);
      LegacyUnit.equal(LineWalker.isAboveLine(5)({ line: 2 }), false);
    });

    suite.test('isLine', function () {
      LegacyUnit.equal(LineWalker.isLine(3)({ line: 3 }), true);
      LegacyUnit.equal(LineWalker.isLine(3)({ line: 4 }), false);
    });

    viewBlock.attach();
    Pipeline.async({}, suite.toSteps({}), function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
