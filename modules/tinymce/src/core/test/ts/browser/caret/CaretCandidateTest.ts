import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as CaretCandidate from 'tinymce/core/caret/CaretCandidate';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretCandidateTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = () => SugarElement.fromDom(viewBlock.get());
  const setupHtml = viewBlock.update;

  it('isCaretCandidate', () => {
    Arr.each('img input textarea hr table iframe video audio object'.split(' '), (name) => {
      assert.isTrue(CaretCandidate.isCaretCandidate(document.createElement(name)));
    });

    assert.isTrue(CaretCandidate.isCaretCandidate(document.createTextNode('text')));
    assert.isTrue(CaretCandidate.isCaretCandidate(SugarElement.fromHtml('<span contentEditable="false"></span>').dom));
    assert.isFalse(CaretCandidate.isCaretCandidate(SugarElement.fromHtml('<span contentEditable="false" unselectable="true"></span>').dom));
    assert.isTrue(CaretCandidate.isCaretCandidate(SugarElement.fromHtml('<div contentEditable="false"></div>').dom));
    assert.isTrue(CaretCandidate.isCaretCandidate(SugarElement.fromHtml('<table><tr><td>X</td></tr></table>').dom));
    assert.isFalse(CaretCandidate.isCaretCandidate(SugarElement.fromHtml('<span contentEditable="true"></span>').dom));
    assert.isFalse(CaretCandidate.isCaretCandidate(SugarElement.fromHtml('<span></span>').dom));
    assert.isFalse(CaretCandidate.isCaretCandidate(document.createComment('text')));
    assert.isFalse(CaretCandidate.isCaretCandidate(SugarElement.fromHtml('<span data-mce-caret="1"></span>').dom));
    assert.isFalse(CaretCandidate.isCaretCandidate(document.createTextNode(Zwsp.ZWSP)));
  });

  it('isInEditable', () => {
    setupHtml('abc<span contentEditable="true"><b><span contentEditable="false">X</span></b></span>');
    assert.isFalse(CaretCandidate.isInEditable(SelectorFind.descendant(getRoot(), 'span span').getOrDie().dom.firstChild as Node, getRoot().dom));
    assert.isTrue(CaretCandidate.isInEditable(SelectorFind.descendant(getRoot(), 'span span').getOrDie().dom, getRoot().dom));
    assert.isTrue(CaretCandidate.isInEditable(SelectorFind.descendant(getRoot(), 'span').getOrDie().dom, getRoot().dom));
    assert.isTrue(CaretCandidate.isInEditable(getRoot().dom.firstChild as Node, getRoot().dom));
  });

  it('isAtomic', () => {
    Arr.each([ 'img', 'input', 'textarea', 'hr' ], (name) => {
      assert.isTrue(CaretCandidate.isAtomic(document.createElement(name)));
    });

    assert.isFalse(CaretCandidate.isAtomic(document.createTextNode('text')));
    assert.isFalse(CaretCandidate.isAtomic(SugarElement.fromHtml('<table><tr><td>X</td></tr></table>').dom));
    assert.isTrue(CaretCandidate.isAtomic(SugarElement.fromHtml('<span contentEditable="false">X</span>').dom));
    assert.isFalse(CaretCandidate.isAtomic(SugarElement.fromHtml('<span contentEditable="false">X<span contentEditable="true">Y</span>Z</span>').dom));
  });

  it('isEditableCaretCandidate', () => {
    setupHtml('abc<b>xx</b><span contentEditable="false"><span contentEditable="false">X</span></span>');
    assert.isTrue(CaretCandidate.isEditableCaretCandidate(getRoot().dom.firstChild, getRoot().dom));
    assert.isFalse(CaretCandidate.isEditableCaretCandidate(SelectorFind.descendant(getRoot(), 'b').getOrDie().dom));
    assert.isTrue(CaretCandidate.isEditableCaretCandidate(SelectorFind.descendant(getRoot(), 'span').getOrDie().dom));
    assert.isFalse(CaretCandidate.isEditableCaretCandidate(SelectorFind.descendant(getRoot(), 'span span').getOrDie().dom));
  });
});
