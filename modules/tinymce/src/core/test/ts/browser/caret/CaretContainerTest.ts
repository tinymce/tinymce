import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { LegacyUnit } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretContainerTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = viewBlock.get;
  const setupHtml = viewBlock.update;

  it('isCaretContainer', () => {
    assert.isFalse(CaretContainer.isCaretContainer(document.createTextNode('text')));
    assert.isFalse(CaretContainer.isCaretContainer(SugarElement.fromHtml('<span></span>').dom));
    assert.isTrue(CaretContainer.isCaretContainer(SugarElement.fromHtml('<span data-mce-caret="1"></span>').dom));
    assert.isTrue(CaretContainer.isCaretContainer(SugarElement.fromHtml('<span data-mce-caret="1">x</span>').dom.firstChild));
    assert.isTrue(CaretContainer.isCaretContainer(document.createTextNode(Zwsp.ZWSP)));
  });

  it('isCaretContainerBlock', () => {
    assert.isFalse(CaretContainer.isCaretContainerBlock(document.createTextNode('text')));
    assert.isFalse(CaretContainer.isCaretContainerBlock(SugarElement.fromHtml('<span></span>').dom));
    assert.isTrue(CaretContainer.isCaretContainerBlock(SugarElement.fromHtml('<span data-mce-caret="1"></span>').dom));
    assert.isTrue(CaretContainer.isCaretContainerBlock(SugarElement.fromHtml('<span data-mce-caret="1">a</span>').dom.firstChild));
    assert.isFalse(CaretContainer.isCaretContainerBlock(document.createTextNode(Zwsp.ZWSP)));
  });

  it('isCaretContainerInline', () => {
    assert.isFalse(CaretContainer.isCaretContainerInline(document.createTextNode('text')));
    assert.isFalse(CaretContainer.isCaretContainerInline(SugarElement.fromHtml('<span></span>').dom));
    assert.isFalse(CaretContainer.isCaretContainerInline(SugarElement.fromHtml('<span data-mce-caret="1"></span>').dom));
    assert.isFalse(CaretContainer.isCaretContainerInline(SugarElement.fromHtml('<span data-mce-caret="1">a</span>').dom.firstChild));
    assert.isTrue(CaretContainer.isCaretContainerInline(document.createTextNode(Zwsp.ZWSP)));
  });

  it('insertInline before element', () => {
    setupHtml('<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().firstChild as HTMLSpanElement, true), getRoot().firstChild as Text);
    assert.isTrue(CaretContainer.isCaretContainerInline(getRoot().firstChild));
  });

  it('insertInline after element', () => {
    setupHtml('<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().firstChild as HTMLSpanElement, false), getRoot().lastChild as Text);
    assert.isTrue(CaretContainer.isCaretContainerInline(getRoot().lastChild));
  });

  it('insertInline between elements', () => {
    setupHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertBlock('p', getRoot().lastChild as HTMLSpanElement, true), getRoot().childNodes[1]);
    assert.isTrue(CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]));
  });

  it('insertInline before element with ZWSP', () => {
    setupHtml('abc' + Zwsp.ZWSP + '<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().lastChild as HTMLSpanElement, true), getRoot().childNodes[1]);
    assert.isFalse(CaretContainer.isCaretContainerInline(getRoot().firstChild));
    assert.isTrue(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]));
  });

  it('insertInline after element with ZWSP', () => {
    setupHtml('<span contentEditable="false">1</span>' + Zwsp.ZWSP + 'abc');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().firstChild as HTMLSpanElement, false), getRoot().childNodes[1]);
    assert.isFalse(CaretContainer.isCaretContainerInline(getRoot().lastChild));
    assert.isTrue(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]));
  });

  it('insertBlock before element', () => {
    setupHtml('<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertBlock('p', getRoot().firstChild as HTMLSpanElement, true), getRoot().firstChild as Element);
    assert.isTrue(CaretContainer.isCaretContainerBlock(getRoot().firstChild));
  });

  it('insertBlock after element', () => {
    setupHtml('<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertBlock('p', getRoot().firstChild as HTMLSpanElement, false), getRoot().lastChild as Element);
    assert.isTrue(CaretContainer.isCaretContainerBlock(getRoot().lastChild));
  });

  it('insertBlock between elements', () => {
    setupHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().lastChild as HTMLSpanElement, true), getRoot().childNodes[1]);
    assert.isTrue(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]));
  });

  it('startsWithCaretContainer', () => {
    setupHtml(Zwsp.ZWSP + 'abc');
    assert.isTrue(CaretContainer.startsWithCaretContainer(getRoot().firstChild));
  });

  it('endsWithCaretContainer', () => {
    setupHtml('abc');
    const textNode = viewBlock.get().firstChild as Text;
    textNode.appendData(Zwsp.ZWSP);
    assert.isTrue(CaretContainer.endsWithCaretContainer(getRoot().firstChild));
  });

  it('hasContent', () => {
    setupHtml('<span contentEditable="false">1</span>');
    const caretContainerBlock = CaretContainer.insertBlock('p', getRoot().firstChild as HTMLSpanElement, true);
    assert.isFalse(CaretContainer.hasContent(caretContainerBlock));
    caretContainerBlock.insertBefore(document.createTextNode('a'), caretContainerBlock.firstChild);
    assert.isTrue(CaretContainer.hasContent(caretContainerBlock));
  });

  it('showCaretContainerBlock', () => {
    setupHtml('<span contentEditable="false">1</span>');
    const caretContainerBlock = CaretContainer.insertBlock('p', getRoot().firstChild as HTMLSpanElement, true) as HTMLElement;
    caretContainerBlock.insertBefore(document.createTextNode('a'), caretContainerBlock.firstChild);
    CaretContainer.showCaretContainerBlock(caretContainerBlock);
    assert.equal(caretContainerBlock.outerHTML, '<p>a</p>');
  });

  it('prependInline', () => {
    setupHtml('a');
    const caretContainerTextNode = CaretContainer.prependInline(getRoot().firstChild) as Text;
    assert.equal(caretContainerTextNode.data, Zwsp.ZWSP + 'a');
  });

  it('prependInline 2', () => {
    setupHtml('<b>a</b>');
    assert.isNull(CaretContainer.prependInline(getRoot().firstChild));
    assert.isNull(CaretContainer.prependInline(null));
  });

  it('appendInline', () => {
    setupHtml('a');
    const caretContainerTextNode = CaretContainer.appendInline(getRoot().firstChild) as Text;
    assert.equal(caretContainerTextNode.data, 'a' + Zwsp.ZWSP);
  });

  it('isBeforeInline', () => {
    setupHtml(Zwsp.ZWSP + 'a');
    assert.isTrue(CaretContainer.isBeforeInline(CaretPosition(getRoot().firstChild as Text, 0)));
    assert.isFalse(CaretContainer.isBeforeInline(CaretPosition(getRoot().firstChild as Text, 1)));
  });

  it('isBeforeInline 2', () => {
    setupHtml('a');
    viewBlock.get().insertBefore(document.createTextNode(Zwsp.ZWSP), viewBlock.get().firstChild);
    assert.isTrue(CaretContainer.isBeforeInline(CaretPosition(getRoot().firstChild as Text, 0)));
    assert.isFalse(CaretContainer.isBeforeInline(CaretPosition(getRoot().firstChild as Text, 1)));
  });

  it('isAfterInline', () => {
    setupHtml(Zwsp.ZWSP + 'a');
    assert.isTrue(CaretContainer.isAfterInline(CaretPosition(getRoot().firstChild as Text, 1)));
    assert.isFalse(CaretContainer.isAfterInline(CaretPosition(getRoot().firstChild as Text, 0)));
  });

  it('isAfterInline 2', () => {
    setupHtml('a');
    viewBlock.get().insertBefore(document.createTextNode(Zwsp.ZWSP), viewBlock.get().firstChild);
    assert.isTrue(CaretContainer.isAfterInline(CaretPosition(getRoot().firstChild as Text, 1)));
    assert.isFalse(CaretContainer.isAfterInline(CaretPosition(getRoot().firstChild as Text, 0)));
  });
});
