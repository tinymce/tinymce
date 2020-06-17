import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import $ from 'tinymce/core/api/dom/DomQuery';
import Env from 'tinymce/core/api/Env';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as LineWalker from 'tinymce/core/caret/LineWalker';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.LineWalkerTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  if (!Env.ceFalse) {
    return;
  }

  const getRoot = function () {
    return viewBlock.get();
  };

  suite.test('positionsUntil', function () {
    let result, predicateCallCount = 0;

    const predicate = function () {
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
    let predicateCallCount = 0;

    const predicate = function () {
      predicateCallCount++;
      return false;
    };

    $(getRoot()).html('<p>a</p><p>b</p><p>c</p>');

    const caretPosition = CaretPosition(getRoot().lastChild.lastChild, 1);
    const result = LineWalker.upUntil(getRoot(), predicate, caretPosition);

    LegacyUnit.equal(result.length, 3);
    LegacyUnit.equal(result[0].line, 0);
    LegacyUnit.equal(result[1].line, 1);
    LegacyUnit.equal(result[2].line, 2);
    LegacyUnit.equal(predicateCallCount, 3);
  });

  suite.test('downUntil', function () {
    let predicateCallCount = 0;

    const predicate = function () {
      predicateCallCount++;
      return false;
    };

    $(getRoot()).html('<p>a</p><p>b</p><p>c</p>');

    const caretPosition = CaretPosition(getRoot().firstChild.firstChild, 0);
    const result = LineWalker.downUntil(getRoot(), predicate, caretPosition);

    LegacyUnit.equal(result.length, 3);
    LegacyUnit.equal(result[0].line, 0);
    LegacyUnit.equal(result[1].line, 1);
    LegacyUnit.equal(result[2].line, 2);
    LegacyUnit.equal(predicateCallCount, 3);
  });

  suite.test('isAboveLine', function () {
    LegacyUnit.equal(LineWalker.isAboveLine(5)({ line: 10 } as LineWalker.ClientRectLine), true);
    LegacyUnit.equal(LineWalker.isAboveLine(5)({ line: 2 } as LineWalker.ClientRectLine), false);
  });

  suite.test('isLine', function () {
    LegacyUnit.equal(LineWalker.isLine(3)({ line: 3 } as LineWalker.ClientRectLine), true);
    LegacyUnit.equal(LineWalker.isLine(3)({ line: 4 } as LineWalker.ClientRectLine), false);
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), function () {
    viewBlock.detach();
    success();
  }, failure);
});
