import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Env from 'tinymce/core/api/Env';
import * as CaretUtils from 'tinymce/core/caret/CaretUtils';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import Zwsp from 'tinymce/core/text/Zwsp';
import $ from 'tinymce/core/api/dom/DomQuery';
import CaretAsserts from '../../module/test/CaretAsserts';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.CaretUtilTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();
  const assertRange = CaretAsserts.assertRange;
  const createRange = CaretAsserts.createRange;
  const viewBlock = ViewBlock();

  if (!Env.ceFalse) {
    return;
  }

  const ZWSP = Zwsp.ZWSP;

  const getRoot = function () {
    return viewBlock.get();
  };

  const setupHtml = function (html) {
    viewBlock.update(html);

    // IE messes zwsp up on innerHTML so we need to first set markers then replace then using dom operations
    viewBlock.get().innerHTML = html.replace(new RegExp(ZWSP, 'g'), '__ZWSP__');
    replaceWithZwsp(viewBlock.get());
  };

  const replaceWithZwsp = function (node) {
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];

      if (childNode.nodeType === 3) {
        childNode.nodeValue = childNode.nodeValue.replace(/__ZWSP__/, ZWSP);
      } else {
        replaceWithZwsp(childNode);
      }
    }
  };

  const findElm = function (selector) {
    return $(selector, getRoot())[0];
  };

  suite.test('isForwards', function () {
    LegacyUnit.equal(CaretUtils.isForwards(1), true);
    LegacyUnit.equal(CaretUtils.isForwards(10), true);
    LegacyUnit.equal(CaretUtils.isForwards(0), false);
    LegacyUnit.equal(CaretUtils.isForwards(-1), false);
    LegacyUnit.equal(CaretUtils.isForwards(-10), false);
  });

  suite.test('isBackwards', function () {
    LegacyUnit.equal(CaretUtils.isBackwards(1), false);
    LegacyUnit.equal(CaretUtils.isBackwards(10), false);
    LegacyUnit.equal(CaretUtils.isBackwards(0), false);
    LegacyUnit.equal(CaretUtils.isBackwards(-1), true);
    LegacyUnit.equal(CaretUtils.isBackwards(-10), true);
  });

  suite.test('findNode', function () {
    setupHtml('<b>abc</b><b><i>123</i></b>def');

    const isBold = function (node) {
      return node.nodeName === 'B';
    };

    const isText = function (node) {
      return node.nodeType === 3;
    };

    LegacyUnit.equalDom(CaretUtils.findNode(getRoot(), 1, isBold, getRoot()), getRoot().firstChild);
    LegacyUnit.equalDom(CaretUtils.findNode(getRoot(), 1, isText, getRoot()), getRoot().firstChild.firstChild);
    LegacyUnit.equal(CaretUtils.findNode(getRoot().childNodes[1], 1, isBold, getRoot().childNodes[1]) === null, true);
    LegacyUnit.equal(CaretUtils.findNode(getRoot().childNodes[1], 1, isText, getRoot().childNodes[1]).nodeName, '#text');
    LegacyUnit.equalDom(CaretUtils.findNode(getRoot(), -1, isBold, getRoot()), getRoot().childNodes[1]);
    LegacyUnit.equalDom(CaretUtils.findNode(getRoot(), -1, isText, getRoot()), getRoot().lastChild);
  });

  suite.test('getEditingHost', function () {
    setupHtml('<span contentEditable="true"><span contentEditable="false"></span></span>');

    LegacyUnit.equalDom(CaretUtils.getEditingHost(getRoot(), getRoot()), getRoot());
    LegacyUnit.equalDom(CaretUtils.getEditingHost(getRoot().firstChild, getRoot()), getRoot());
    LegacyUnit.equalDom(CaretUtils.getEditingHost(getRoot().firstChild.firstChild, getRoot()), getRoot().firstChild);
  });

  suite.test('getParentBlock', function () {
    setupHtml('<p>abc</p><div><p><table><tr><td>X</td></tr></p></div>');

    LegacyUnit.equalDom(CaretUtils.getParentBlock(findElm('p:first')), findElm('p:first'));
    LegacyUnit.equalDom(CaretUtils.getParentBlock(findElm('td:first').firstChild), findElm('td:first'));
    LegacyUnit.equalDom(CaretUtils.getParentBlock(findElm('td:first')), findElm('td:first'));
    LegacyUnit.equalDom(CaretUtils.getParentBlock(findElm('table')), findElm('table'));
  });

  suite.test('isInSameBlock', function () {
    setupHtml('<p>abc</p><p>def<b>ghj</b></p>');

    LegacyUnit.strictEqual(CaretUtils.isInSameBlock(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(findElm('p:last').firstChild, 0)
    ), false);

    LegacyUnit.strictEqual(CaretUtils.isInSameBlock(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(findElm('p:first').firstChild, 0)
    ), true);

    LegacyUnit.strictEqual(CaretUtils.isInSameBlock(
      CaretPosition(findElm('p:last').firstChild, 0),
      CaretPosition(findElm('b').firstChild, 0)
    ), true);
  });

  suite.test('isInSameEditingHost', function () {
    setupHtml(
      '<p>abc</p>' +
      'def' +
      '<span contentEditable="false">' +
      '<span contentEditable="true">ghi</span>' +
      '<span contentEditable="true">jkl</span>' +
      '</span>'
    );

    LegacyUnit.strictEqual(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(findElm('p:first').firstChild, 1)
    ), true);

    LegacyUnit.strictEqual(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(getRoot().childNodes[1], 1)
    ), true);

    LegacyUnit.strictEqual(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('span span:first').firstChild, 0),
      CaretPosition(findElm('span span:first').firstChild, 1)
    ), true);

    LegacyUnit.strictEqual(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(findElm('span span:first').firstChild, 1)
    ), false);

    LegacyUnit.strictEqual(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('span span:first').firstChild, 0),
      CaretPosition(findElm('span span:last').firstChild, 1)
    ), false);
  });

  suite.test('normalizeRange', function () {
    setupHtml(
      'abc<span contentEditable="false">1</span>def'
    );

    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 2)), createRange(getRoot().firstChild, 2));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 2)), createRange(getRoot().lastChild, 2));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 2));
  });

  suite.test('normalizeRange deep', function () {
    setupHtml(
      '<i><b>abc</b></i><span contentEditable="false">1</span><i><b>def</b></i>'
    );

    assertRange(
      CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('b').firstChild, 2)),
      createRange(findElm('b').firstChild, 2)
    );
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('b').firstChild, 3)), createRange(getRoot(), 1));
    assertRange(
      CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('b:last').firstChild, 1)),
      createRange(findElm('b:last').firstChild, 1)
    );
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('b:last').firstChild, 0)), createRange(getRoot(), 2));
  });

  suite.test('normalizeRange break at candidate', function () {
    setupHtml(
      '<p><b>abc</b><input></p><p contentEditable="false">1</p><p><input><b>abc</b></p>'
    );

    assertRange(
      CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('b').firstChild, 3)),
      createRange(findElm('b').firstChild, 3)
    );
    assertRange(
      CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('b:last').lastChild, 0)),
      createRange(findElm('b:last').lastChild, 0)
    );
  });

  suite.test('normalizeRange at block caret container', function () {
    setupHtml(
      '<p data-mce-caret="before">\u00a0</p><p contentEditable="false">1</p><p data-mce-caret="after">\u00a0</p>'
    );

    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('p:first').firstChild, 0)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('p:first').firstChild, 1)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('p:last').firstChild, 0)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('p:last').firstChild, 1)), createRange(getRoot(), 2));
  });

  suite.test('normalizeRange at inline caret container', function () {
    setupHtml(
      'abc<span contentEditable="false">1</span>def'
    );

    getRoot().insertBefore(document.createTextNode(ZWSP), getRoot().childNodes[1]);
    getRoot().insertBefore(document.createTextNode(ZWSP), getRoot().childNodes[3]);

    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().childNodes[1], 0)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().childNodes[1], 1)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 3));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().childNodes[3], 0)), createRange(getRoot(), 3));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().childNodes[3], 1)), createRange(getRoot(), 3));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().childNodes[1], 0)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().childNodes[1], 1)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 3));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().childNodes[3], 0)), createRange(getRoot(), 3));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().childNodes[3], 1)), createRange(getRoot(), 3));
  });

  suite.test('normalizeRange at inline caret container (combined)', function () {
    setupHtml(
      'abc' + ZWSP + '<span contentEditable="false">1</span>' + ZWSP + 'def'
    );

    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 4)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().lastChild, 1)), createRange(getRoot(), 2));
  });

  suite.test('normalizeRange at inline caret container after block', function () {
    setupHtml(
      '<p><span contentEditable="false">1</span></p>' + ZWSP + 'abc'
    );

    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot().lastChild, 0));
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), function () {
    viewBlock.detach();
    success();
  }, failure);
});
