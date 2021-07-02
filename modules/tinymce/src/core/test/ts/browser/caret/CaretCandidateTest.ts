import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import $ from 'tinymce/core/api/dom/DomQuery';
import * as CaretCandidate from 'tinymce/core/caret/CaretCandidate';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.CaretCandidateTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const getRoot = viewBlock.get;
  const setupHtml = viewBlock.update;

  it('isCaretCandidate', () => {
    $.each('img input textarea hr table iframe video audio object'.split(' '), (index, name) => {
      assert.isTrue(CaretCandidate.isCaretCandidate(document.createElement(name)));
    });

    assert.isTrue(CaretCandidate.isCaretCandidate(document.createTextNode('text')));
    assert.isTrue(CaretCandidate.isCaretCandidate($('<span contentEditable="false"></span>')[0]));
    assert.isFalse(CaretCandidate.isCaretCandidate($('<span contentEditable="false" unselectable="true"></span>')[0]));
    assert.isTrue(CaretCandidate.isCaretCandidate($('<div contentEditable="false"></div>')[0]));
    assert.isTrue(CaretCandidate.isCaretCandidate($('<table><tr><td>X</td></tr></table>')[0]));
    assert.isFalse(CaretCandidate.isCaretCandidate($('<span contentEditable="true"></span>')[0]));
    assert.isFalse(CaretCandidate.isCaretCandidate($('<span></span>')[0]));
    assert.isFalse(CaretCandidate.isCaretCandidate(document.createComment('text')));
    assert.isFalse(CaretCandidate.isCaretCandidate($('<span data-mce-caret="1"></span>')[0]));
    assert.isFalse(CaretCandidate.isCaretCandidate(document.createTextNode(Zwsp.ZWSP)));
  });

  it('isInEditable', () => {
    setupHtml('abc<span contentEditable="true"><b><span contentEditable="false">X</span></b></span>');
    assert.isFalse(CaretCandidate.isInEditable($('span span', getRoot())[0].firstChild, getRoot()));
    assert.isTrue(CaretCandidate.isInEditable($('span span', getRoot())[0], getRoot()));
    assert.isTrue(CaretCandidate.isInEditable($('span', getRoot())[0], getRoot()));
    assert.isTrue(CaretCandidate.isInEditable(getRoot().firstChild, getRoot()));
  });

  it('isAtomic', () => {
    $.each([ 'img', 'input', 'textarea', 'hr' ], (index, name) => {
      assert.isTrue(CaretCandidate.isAtomic(document.createElement(name)));
    });

    assert.isFalse(CaretCandidate.isAtomic(document.createTextNode('text')));
    assert.isFalse(CaretCandidate.isAtomic($('<table><tr><td>X</td></tr></table>')[0]));
    assert.isTrue(CaretCandidate.isAtomic($('<span contentEditable="false">X</span>')[0]));
    assert.isFalse(CaretCandidate.isAtomic($('<span contentEditable="false">X<span contentEditable="true">Y</span>Z</span>')[0]));
  });

  it('isEditableCaretCandidate', () => {
    setupHtml('abc<b>xx</b><span contentEditable="false"><span contentEditable="false">X</span></span>');
    assert.isTrue(CaretCandidate.isEditableCaretCandidate(getRoot().firstChild, getRoot()));
    assert.isFalse(CaretCandidate.isEditableCaretCandidate($('b', getRoot())[0]));
    assert.isTrue(CaretCandidate.isEditableCaretCandidate($('span', getRoot())[0]));
    assert.isFalse(CaretCandidate.isEditableCaretCandidate($('span span', getRoot())[0]));
  });
});
