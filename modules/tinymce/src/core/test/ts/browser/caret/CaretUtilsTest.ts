import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import $ from 'tinymce/core/api/dom/DomQuery';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as CaretUtils from 'tinymce/core/caret/CaretUtils';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as CaretAsserts from '../../module/test/CaretAsserts';
import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretUtilTest', () => {
  const assertRange = CaretAsserts.assertRange;
  const createRange = CaretAsserts.createRange;
  const viewBlock = ViewBlock.bddSetup();

  const ZWSP = Zwsp.ZWSP;

  const getRoot = viewBlock.get;

  const setupHtml = (html: string) => {
    viewBlock.update(html);

    // IE messes zwsp up on innerHTML so we need to first set markers then replace then using dom operations
    viewBlock.get().innerHTML = html.replace(new RegExp(ZWSP, 'g'), '__ZWSP__');
    replaceWithZwsp(viewBlock.get());
  };

  const replaceWithZwsp = (node: Node) => {
    Arr.each(node.childNodes, (childNode) => {
      if (childNode.nodeType === 3) {
        childNode.nodeValue = childNode.nodeValue.replace(/__ZWSP__/, ZWSP);
      } else {
        replaceWithZwsp(childNode);
      }
    });
  };

  const findElm = (selector: string) => $(selector, getRoot())[0];

  it('isForwards', () => {
    assert.isTrue(CaretUtils.isForwards(1));
    assert.isTrue(CaretUtils.isForwards(10));
    assert.isFalse(CaretUtils.isForwards(0));
    assert.isFalse(CaretUtils.isForwards(-1));
    assert.isFalse(CaretUtils.isForwards(-10));
  });

  it('isBackwards', () => {
    assert.isFalse(CaretUtils.isBackwards(1));
    assert.isFalse(CaretUtils.isBackwards(10));
    assert.isFalse(CaretUtils.isBackwards(0));
    assert.isTrue(CaretUtils.isBackwards(-1));
    assert.isTrue(CaretUtils.isBackwards(-10));
  });

  it('findNode', () => {
    setupHtml('<b>abc</b><b><i>123</i></b>def');

    const isBold = (node: Node) => {
      return node.nodeName === 'B';
    };

    const isText = (node: Node) => {
      return node.nodeType === 3;
    };

    LegacyUnit.equalDom(CaretUtils.findNode(getRoot(), 1, isBold, getRoot()), getRoot().firstChild);
    LegacyUnit.equalDom(CaretUtils.findNode(getRoot(), 1, isText, getRoot()), getRoot().firstChild.firstChild);
    assert.isNull(CaretUtils.findNode(getRoot().childNodes[1], 1, isBold, getRoot().childNodes[1]));
    assert.equal(CaretUtils.findNode(getRoot().childNodes[1], 1, isText, getRoot().childNodes[1]).nodeName, '#text');
    LegacyUnit.equalDom(CaretUtils.findNode(getRoot(), -1, isBold, getRoot()), getRoot().childNodes[1]);
    LegacyUnit.equalDom(CaretUtils.findNode(getRoot(), -1, isText, getRoot()), getRoot().lastChild);
  });

  it('getEditingHost', () => {
    setupHtml('<span contentEditable="true"><span contentEditable="false"></span></span>');

    LegacyUnit.equalDom(CaretUtils.getEditingHost(getRoot(), getRoot()), getRoot());
    LegacyUnit.equalDom(CaretUtils.getEditingHost(getRoot().firstChild, getRoot()), getRoot());
    LegacyUnit.equalDom(CaretUtils.getEditingHost(getRoot().firstChild.firstChild, getRoot()), getRoot().firstChild);
  });

  it('getParentBlock', () => {
    setupHtml('<p>abc</p><div><p><table><tr><td>X</td></tr></p></div>');

    LegacyUnit.equalDom(CaretUtils.getParentBlock(findElm('p:first')), findElm('p:first'));
    LegacyUnit.equalDom(CaretUtils.getParentBlock(findElm('td:first').firstChild), findElm('td:first'));
    LegacyUnit.equalDom(CaretUtils.getParentBlock(findElm('td:first')), findElm('td:first'));
    LegacyUnit.equalDom(CaretUtils.getParentBlock(findElm('table')), findElm('table'));
  });

  it('isInSameBlock', () => {
    setupHtml('<p>abc</p><p>def<b>ghj</b></p>');

    assert.isFalse(CaretUtils.isInSameBlock(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(findElm('p:last').firstChild, 0)
    ));

    assert.isTrue(CaretUtils.isInSameBlock(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(findElm('p:first').firstChild, 0)
    ));

    assert.isTrue(CaretUtils.isInSameBlock(
      CaretPosition(findElm('p:last').firstChild, 0),
      CaretPosition(findElm('b').firstChild, 0)
    ));
  });

  it('isInSameEditingHost', () => {
    setupHtml(
      '<p>abc</p>' +
      'def' +
      '<span contentEditable="false">' +
      '<span contentEditable="true">ghi</span>' +
      '<span contentEditable="true">jkl</span>' +
      '</span>'
    );

    assert.isTrue(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(findElm('p:first').firstChild, 1)
    ));

    assert.isTrue(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(getRoot().childNodes[1], 1)
    ));

    assert.isTrue(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('span span:first').firstChild, 0),
      CaretPosition(findElm('span span:first').firstChild, 1)
    ));

    assert.isFalse(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('p:first').firstChild, 0),
      CaretPosition(findElm('span span:first').firstChild, 1)
    ));

    assert.isFalse(CaretUtils.isInSameEditingHost(
      CaretPosition(findElm('span span:first').firstChild, 0),
      CaretPosition(findElm('span span:last').firstChild, 1)
    ));
  });

  it('normalizeRange', () => {
    setupHtml(
      'abc<span contentEditable="false">1</span>def'
    );

    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 2)), createRange(getRoot().firstChild, 2));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 2)), createRange(getRoot().lastChild, 2));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 2));
  });

  it('normalizeRange deep', () => {
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

  it('normalizeRange break at candidate', () => {
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

  it('normalizeRange at block caret container', () => {
    setupHtml(
      '<p data-mce-caret="before">\u00a0</p><p contentEditable="false">1</p><p data-mce-caret="after">\u00a0</p>'
    );

    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('p:first').firstChild, 0)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(findElm('p:first').firstChild, 1)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('p:last').firstChild, 0)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(findElm('p:last').firstChild, 1)), createRange(getRoot(), 2));
  });

  it('normalizeRange at inline caret container', () => {
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

  it('normalizeRange at inline caret container (combined)', () => {
    setupHtml(
      'abc' + ZWSP + '<span contentEditable="false">1</span>' + ZWSP + 'def'
    );

    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 3)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().firstChild, 4)), createRange(getRoot(), 1));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot(), 2));
    assertRange(CaretUtils.normalizeRange(-1, getRoot(), createRange(getRoot().lastChild, 1)), createRange(getRoot(), 2));
  });

  it('normalizeRange at inline caret container after block', () => {
    setupHtml(
      '<p><span contentEditable="false">1</span></p>' + ZWSP + 'abc'
    );

    assertRange(CaretUtils.normalizeRange(1, getRoot(), createRange(getRoot().lastChild, 0)), createRange(getRoot().lastChild, 0));
  });
});
