import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import CaretPosition from 'tinymce/core/caret/CaretPosition';

import * as CaretAsserts from '../../module/test/CaretAsserts';
import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretPositionTest', () => {
  const createRange = CaretAsserts.createRange;
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = viewBlock.get;
  const setupHtml = viewBlock.update;

  it('Constructor', () => {
    setupHtml('abc');
    LegacyUnit.equalDom(CaretPosition(getRoot(), 0).container(), getRoot());
    assert.strictEqual(CaretPosition(getRoot(), 1).offset(), 1);
    LegacyUnit.equalDom(CaretPosition(getRoot().firstChild as Text, 0).container(), getRoot().firstChild as Text);
    assert.strictEqual(CaretPosition(getRoot().firstChild as Text, 1).offset(), 1);
  });

  it('fromRangeStart', () => {
    setupHtml('abc');
    CaretAsserts.assertCaretPosition(CaretPosition.fromRangeStart(createRange(getRoot(), 0)), CaretPosition(getRoot(), 0));
    CaretAsserts.assertCaretPosition(CaretPosition.fromRangeStart(createRange(getRoot(), 1)), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(
      CaretPosition.fromRangeStart(createRange(getRoot().firstChild as Text, 1)),
      CaretPosition(getRoot().firstChild as Text, 1)
    );
  });

  it('fromRangeEnd', () => {
    setupHtml('abc');
    CaretAsserts.assertCaretPosition(
      CaretPosition.fromRangeEnd(createRange(getRoot(), 0, getRoot(), 1)),
      CaretPosition(getRoot(), 1)
    );
    CaretAsserts.assertCaretPosition(
      CaretPosition.fromRangeEnd(createRange(getRoot().firstChild as Text, 0, getRoot().firstChild as Text, 1)),
      CaretPosition(getRoot().firstChild as Text, 1)
    );
  });

  it('after', () => {
    setupHtml('abc<b>123</b>');
    CaretAsserts.assertCaretPosition(CaretPosition.after(getRoot().firstChild as Text), CaretPosition(getRoot(), 1));
    CaretAsserts.assertCaretPosition(CaretPosition.after(getRoot().lastChild as HTMLElement), CaretPosition(getRoot(), 2));
  });

  it('before', () => {
    setupHtml('abc<b>123</b>');
    CaretAsserts.assertCaretPosition(CaretPosition.before(getRoot().firstChild as Text), CaretPosition(getRoot(), 0));
    CaretAsserts.assertCaretPosition(CaretPosition.before(getRoot().lastChild as HTMLElement), CaretPosition(getRoot(), 1));
  });

  it('isAtStart', () => {
    setupHtml('abc<b>123</b>123');
    assert.isTrue(CaretPosition(getRoot(), 0).isAtStart());
    assert.isFalse(CaretPosition(getRoot(), 1).isAtStart());
    assert.isFalse(CaretPosition(getRoot(), 3).isAtStart());
    assert.isTrue(CaretPosition(getRoot().firstChild as Text, 0).isAtStart());
    assert.isFalse(CaretPosition(getRoot().firstChild as Text, 1).isAtStart());
    assert.isFalse(CaretPosition(getRoot().firstChild as Text, 3).isAtStart());
  });

  it('isAtEnd', () => {
    setupHtml('abc<b>123</b>123');
    assert.isTrue(CaretPosition(getRoot(), 3).isAtEnd());
    assert.isFalse(CaretPosition(getRoot(), 2).isAtEnd());
    assert.isFalse(CaretPosition(getRoot(), 0).isAtEnd());
    assert.isTrue(CaretPosition(getRoot().firstChild as Text, 3).isAtEnd());
    assert.isFalse(CaretPosition(getRoot().firstChild as Text, 0).isAtEnd());
    assert.isFalse(CaretPosition(getRoot().firstChild as Text, 1).isAtEnd());
  });

  it('toRange', () => {
    setupHtml('abc');
    CaretAsserts.assertRange(CaretPosition(getRoot(), 0).toRange(), createRange(getRoot(), 0));
    CaretAsserts.assertRange(CaretPosition(getRoot(), 1).toRange(), createRange(getRoot(), 1));
    CaretAsserts.assertRange(CaretPosition(getRoot().firstChild as Text, 1).toRange(), createRange(getRoot().firstChild as Text, 1));
  });

  it('isEqual', () => {
    setupHtml('abc');
    assert.isTrue(CaretPosition(getRoot(), 0).isEqual(CaretPosition(getRoot(), 0)));
    assert.isFalse(CaretPosition(getRoot(), 1).isEqual(CaretPosition(getRoot(), 0)));
    assert.isFalse(CaretPosition(getRoot(), 0).isEqual(CaretPosition(getRoot().firstChild as Text, 0)));
  });

  it('isVisible', () => {
    setupHtml('<b>  abc</b>');
    assert.isFalse(CaretPosition(getRoot().firstChild?.firstChild as Text, 0).isVisible());
    assert.isTrue(CaretPosition(getRoot().firstChild?.firstChild as Text, 3).isVisible());
  });

  it('getClientRects', () => {
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

    assert.lengthOf(CaretPosition(getRoot().firstChild?.firstChild as Text, 0).getClientRects(), 1);
    assert.lengthOf(CaretPosition(getRoot(), 1).getClientRects(), 1);
    assert.lengthOf(CaretPosition(getRoot(), 2).getClientRects(), 2);
    assert.lengthOf(CaretPosition(getRoot(), 3).getClientRects(), 2);
    assert.lengthOf(CaretPosition(getRoot(), 4).getClientRects(), 2);
    assert.lengthOf(CaretPosition(getRoot(), 5).getClientRects(), 1);
    assert.lengthOf(CaretPosition(getRoot(), 6).getClientRects(), 1);
    assert.lengthOf(CaretPosition(getRoot(), 7).getClientRects(), 1);
    assert.lengthOf(CaretPosition(getRoot(), 8).getClientRects(), 1);
    assert.lengthOf(CaretPosition(getRoot(), 9).getClientRects(), 0);
  });

  it('getClientRects between inline node and cE=false', () => {
    setupHtml(
      '<span contentEditable="false">def</span>' +
      '<b>ghi</b>'
    );

    assert.lengthOf(CaretPosition(getRoot(), 1).getClientRects(), 1);
  });

  it('getClientRects at last visible character', () => {
    setupHtml('<b>a  </b>');

    assert.lengthOf(CaretPosition(getRoot().firstChild?.firstChild as Text, 1).getClientRects(), 1);
  });

  it('getClientRects at extending character', () => {
    setupHtml('a');
    const textNode = getRoot().firstChild as Text;
    textNode.appendData('\u0301b');

    assert.lengthOf(CaretPosition(textNode, 0).getClientRects(), 1);
    assert.lengthOf(CaretPosition(textNode, 1).getClientRects(), 0);
    assert.lengthOf(CaretPosition(textNode, 2).getClientRects(), 1);
  });

  it('getClientRects at whitespace character', () => {
    setupHtml('  a  ');

    assert.lengthOf(CaretPosition(getRoot().firstChild as Text, 0).getClientRects(), 0);
    assert.lengthOf(CaretPosition(getRoot().firstChild as Text, 1).getClientRects(), 0);
    assert.lengthOf(CaretPosition(getRoot().firstChild as Text, 2).getClientRects(), 1);
    assert.lengthOf(CaretPosition(getRoot().firstChild as Text, 3).getClientRects(), 1);
    assert.lengthOf(CaretPosition(getRoot().firstChild as Text, 4).getClientRects(), 0);
    assert.lengthOf(CaretPosition(getRoot().firstChild as Text, 5).getClientRects(), 0);
  });

  it('getClientRects at only one text node should return client rects', () => {
    setupHtml('<p>a<br>b</p>');
    assert.isAbove(CaretPosition(getRoot().firstChild?.firstChild as Text, 0).getClientRects().length, 0);
    assert.isAbove(CaretPosition(getRoot().firstChild?.firstChild as Text, 1).getClientRects().length, 0);
    assert.isAbove(CaretPosition(getRoot().firstChild?.lastChild as Text, 0).getClientRects().length, 0);
    assert.isAbove(CaretPosition(getRoot().firstChild?.lastChild as Text, 1).getClientRects().length, 0);
  });

  it('getNode', () => {
    setupHtml('<b>abc</b><input><input>');

    LegacyUnit.equalDom(CaretPosition(getRoot().firstChild?.firstChild as Text, 0).getNode() as Text, getRoot().firstChild?.firstChild as Text);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 1).getNode() as HTMLElement, getRoot().childNodes[1]);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 2).getNode() as HTMLInputElement, getRoot().childNodes[2]);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 3).getNode() as HTMLInputElement, getRoot().childNodes[2]);
  });

  it('getNode (before)', () => {
    setupHtml('<b>abc</b><input><input>');

    LegacyUnit.equalDom(CaretPosition(getRoot().firstChild?.firstChild as Text, 0).getNode(true) as Text, getRoot().firstChild?.firstChild as Text);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 1).getNode(true) as HTMLElement, getRoot().childNodes[0]);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 2).getNode(true) as HTMLInputElement, getRoot().childNodes[1]);
    LegacyUnit.equalDom(CaretPosition(getRoot(), 3).getNode(true) as HTMLInputElement, getRoot().childNodes[2]);
  });

  it('isAtStart/isAtEnd/isTextPosition', () => {
    setupHtml('<b>abc</b><p><input></p>');

    assert.isTrue(CaretPosition.isAtStart(CaretPosition(getRoot().firstChild?.firstChild as Text, 0)));
    assert.isFalse(CaretPosition.isAtStart(CaretPosition(getRoot().firstChild?.firstChild as Text, 1)));
    assert.isFalse(CaretPosition.isAtStart(CaretPosition(getRoot().firstChild?.firstChild as Text, 3)));
    assert.isTrue(CaretPosition.isAtStart(CaretPosition(getRoot().lastChild as HTMLParagraphElement, 0)));
    assert.isFalse(CaretPosition.isAtStart(CaretPosition(getRoot().lastChild as HTMLParagraphElement, 1)));
    assert.isTrue(CaretPosition.isAtEnd(CaretPosition(getRoot().firstChild?.firstChild as Text, 3)));
    assert.isFalse(CaretPosition.isAtEnd(CaretPosition(getRoot().firstChild?.firstChild as Text, 1)));
    assert.isFalse(CaretPosition.isAtEnd(CaretPosition(getRoot().firstChild?.firstChild as Text, 0)));
    assert.isTrue(CaretPosition.isAtEnd(CaretPosition(getRoot().lastChild as HTMLParagraphElement, 1)));
    assert.isFalse(CaretPosition.isAtEnd(CaretPosition(getRoot().lastChild as HTMLParagraphElement, 0)));
    assert.isTrue(CaretPosition.isTextPosition(CaretPosition(getRoot().firstChild?.firstChild as Text, 0)));
    assert.isFalse(CaretPosition.isTextPosition(CaretPosition(getRoot().lastChild as HTMLParagraphElement, 0)));
  });
});
