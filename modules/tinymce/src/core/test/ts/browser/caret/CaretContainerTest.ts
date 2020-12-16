import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Env from 'tinymce/core/api/Env';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.CaretContainerTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  if (!Env.ceFalse) {
    return;
  }

  const getRoot = () => {
    return viewBlock.get();
  };

  const setupHtml = (html) => {
    viewBlock.update(html);
  };

  suite.test('isCaretContainer', () => {
    LegacyUnit.equal(CaretContainer.isCaretContainer(document.createTextNode('text')), false);
    LegacyUnit.equal(CaretContainer.isCaretContainer(DomQuery('<span></span>')[0]), false);
    LegacyUnit.equal(CaretContainer.isCaretContainer(DomQuery('<span data-mce-caret="1"></span>')[0]), true);
    LegacyUnit.equal(CaretContainer.isCaretContainer(DomQuery('<span data-mce-caret="1">x</span>')[0].firstChild), true);
    LegacyUnit.equal(CaretContainer.isCaretContainer(document.createTextNode(Zwsp.ZWSP)), true);
  });

  suite.test('isCaretContainerBlock', () => {
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(document.createTextNode('text')), false);
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(DomQuery('<span></span>')[0]), false);
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(DomQuery('<span data-mce-caret="1"></span>')[0]), true);
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(DomQuery('<span data-mce-caret="1">a</span>')[0].firstChild), true);
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(document.createTextNode(Zwsp.ZWSP)), false);
  });

  suite.test('isCaretContainerInline', () => {
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(document.createTextNode('text')), false);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(DomQuery('<span></span>')[0]), false);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(DomQuery('<span data-mce-caret="1"></span>')[0]), false);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(DomQuery('<span data-mce-caret="1">a</span>')[0].firstChild), false);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(document.createTextNode(Zwsp.ZWSP)), true);
  });

  suite.test('insertInline before element', () => {
    setupHtml('<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().firstChild, true), getRoot().firstChild);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), true);
  });

  suite.test('insertInline after element', () => {
    setupHtml('<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().firstChild, false), getRoot().lastChild);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().lastChild), true);
  });

  suite.test('insertInline between elements', () => {
    setupHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertBlock('p', getRoot().lastChild, true), getRoot().childNodes[1]);
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]), true);
  });

  suite.test('insertInline before element with ZWSP', () => {
    setupHtml('abc' + Zwsp.ZWSP + '<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().lastChild, true), getRoot().childNodes[1]);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), false);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
  });

  suite.test('insertInline after element with ZWSP', () => {
    setupHtml('<span contentEditable="false">1</span>' + Zwsp.ZWSP + 'abc');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().firstChild, false), getRoot().childNodes[1]);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().lastChild), false);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
  });

  suite.test('insertBlock before element', () => {
    setupHtml('<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertBlock('p', getRoot().firstChild, true), getRoot().firstChild);
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(getRoot().firstChild), true);
  });

  suite.test('insertBlock after element', () => {
    setupHtml('<span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertBlock('p', getRoot().firstChild, false), getRoot().lastChild);
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(getRoot().lastChild), true);
  });

  suite.test('insertBlock between elements', () => {
    setupHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
    LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().lastChild, true), getRoot().childNodes[1]);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
  });

  suite.test('startsWithCaretContainer', () => {
    setupHtml(Zwsp.ZWSP + 'abc');
    LegacyUnit.equal(CaretContainer.startsWithCaretContainer(getRoot().firstChild), true);
  });

  suite.test('endsWithCaretContainer', () => {
    setupHtml('abc');
    const textNode = viewBlock.get().firstChild as Text;
    textNode.appendData(Zwsp.ZWSP);
    LegacyUnit.equal(CaretContainer.endsWithCaretContainer(getRoot().firstChild), true);
  });

  suite.test('hasContent', () => {
    setupHtml('<span contentEditable="false">1</span>');
    const caretContainerBlock = CaretContainer.insertBlock('p', getRoot().firstChild, true);
    LegacyUnit.equal(CaretContainer.hasContent(caretContainerBlock), false);
    caretContainerBlock.insertBefore(document.createTextNode('a'), caretContainerBlock.firstChild);
    LegacyUnit.equal(CaretContainer.hasContent(caretContainerBlock), true);
  });

  suite.test('showCaretContainerBlock', () => {
    setupHtml('<span contentEditable="false">1</span>');
    const caretContainerBlock = CaretContainer.insertBlock('p', getRoot().firstChild, true) as HTMLElement;
    caretContainerBlock.insertBefore(document.createTextNode('a'), caretContainerBlock.firstChild);
    CaretContainer.showCaretContainerBlock(caretContainerBlock);
    LegacyUnit.equal(caretContainerBlock.outerHTML, '<p>a</p>');
  });

  suite.test('prependInline', () => {
    setupHtml('a');
    const caretContainerTextNode = CaretContainer.prependInline(getRoot().firstChild) as Text;
    LegacyUnit.equal(caretContainerTextNode.data, Zwsp.ZWSP + 'a');
  });

  suite.test('prependInline 2', () => {
    setupHtml('<b>a</b>');
    LegacyUnit.equal(CaretContainer.prependInline(getRoot().firstChild), null);
    LegacyUnit.equal(CaretContainer.prependInline(null), null);
  });

  suite.test('appendInline', () => {
    setupHtml('a');
    const caretContainerTextNode = CaretContainer.appendInline(getRoot().firstChild) as Text;
    LegacyUnit.equal(caretContainerTextNode.data, 'a' + Zwsp.ZWSP);
  });

  suite.test('isBeforeInline', () => {
    setupHtml(Zwsp.ZWSP + 'a');
    LegacyUnit.equal(CaretContainer.isBeforeInline(CaretPosition(getRoot().firstChild, 0)), true);
    LegacyUnit.equal(CaretContainer.isBeforeInline(CaretPosition(getRoot().firstChild, 1)), false);
  });
  suite.test('isBeforeInline 2', () => {
    setupHtml('a');
    viewBlock.get().insertBefore(document.createTextNode(Zwsp.ZWSP), viewBlock.get().firstChild);
    LegacyUnit.equal(CaretContainer.isBeforeInline(CaretPosition(getRoot().firstChild, 0)), true);
    LegacyUnit.equal(CaretContainer.isBeforeInline(CaretPosition(getRoot().firstChild, 1)), false);
  });

  suite.test('isAfterInline', () => {
    setupHtml(Zwsp.ZWSP + 'a');
    LegacyUnit.equal(CaretContainer.isAfterInline(CaretPosition(getRoot().firstChild, 1)), true);
    LegacyUnit.equal(CaretContainer.isAfterInline(CaretPosition(getRoot().firstChild, 0)), false);
  });

  suite.test('isAfterInline 2', () => {
    setupHtml('a');
    viewBlock.get().insertBefore(document.createTextNode(Zwsp.ZWSP), viewBlock.get().firstChild);
    LegacyUnit.equal(CaretContainer.isAfterInline(CaretPosition(getRoot().firstChild, 1)), true);
    LegacyUnit.equal(CaretContainer.isAfterInline(CaretPosition(getRoot().firstChild, 0)), false);
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), () => {
    viewBlock.detach();
    success();
  }, failure);
});
