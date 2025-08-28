import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import * as CaretContainerRemove from 'tinymce/core/caret/CaretContainerRemove';
import CaretPosition from 'tinymce/core/caret/CaretPosition';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretContainerRemoveTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = viewBlock.get;
  const setupHtml = viewBlock.update;

  it('remove', () => {
    setupHtml('<span contentEditable="false">1</span>');

    CaretContainer.insertInline(getRoot().firstChild as Node, true);
    assert.isTrue(CaretContainer.isCaretContainerInline(getRoot().firstChild), 'Should be inline container');

    CaretContainerRemove.remove(getRoot().firstChild);
    assert.isFalse(CaretContainer.isCaretContainerInline(getRoot().firstChild), 'Should not be inline container');
  });

  it('removeAndReposition block in same parent at offset', () => {
    setupHtml('<span contentEditable="false">1</span>');

    CaretContainer.insertBlock('p', getRoot().firstChild as Node, true);
    assert.isTrue(CaretContainer.isCaretContainerBlock(getRoot().firstChild), 'Should be block container');

    const pos = CaretContainerRemove.removeAndReposition(getRoot().firstChild as Node, CaretPosition(getRoot(), 0));
    assert.equal(pos.offset(), 0, 'Should be unchanged offset');
    Assertions.assertDomEq('Should be unchanged container', SugarElement.fromDom(getRoot()), SugarElement.fromDom(pos.container()));
    assert.isFalse(CaretContainer.isCaretContainerBlock(getRoot().firstChild), 'Should not be block container');
  });

  it('removeAndReposition block in same parent before offset', () => {
    setupHtml('<span contentEditable="false">1</span><span contentEditable="false">2</span>');

    CaretContainer.insertBlock('p', getRoot().childNodes[1], true);
    assert.isTrue(CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]), 'Should be block container');

    const pos = CaretContainerRemove.removeAndReposition(getRoot().childNodes[1], CaretPosition(getRoot(), 0));
    assert.equal(pos.offset(), 0, 'Should be unchanged offset');
    Assertions.assertDomEq('Should be unchanged container', SugarElement.fromDom(getRoot()), SugarElement.fromDom(pos.container()));
    assert.isFalse(CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]), 'Should not be block container');
  });

  it('removeAndReposition block in same parent after offset', () => {
    setupHtml('<span contentEditable="false">1</span><span contentEditable="false">2</span>');

    CaretContainer.insertBlock('p', getRoot().childNodes[1], true);
    assert.isTrue(CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]), 'Should be block container');

    const pos = CaretContainerRemove.removeAndReposition(getRoot().childNodes[1], CaretPosition(getRoot(), 3));
    assert.equal(pos.offset(), 2, 'Should be changed offset');
    Assertions.assertDomEq('Should be unchanged container', SugarElement.fromDom(getRoot()), SugarElement.fromDom(pos.container()));
    assert.isFalse(CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]), 'Should not be block container');
  });
});
