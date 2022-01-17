import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as NodeType from 'tinymce/core/dom/NodeType';

describe('browser.tinymce.core.dom.NodeTypeTest', () => {
  it('isText/isElement/isComment', () => {
    assert.isTrue(NodeType.isText(document.createTextNode('x')));
    assert.isFalse(NodeType.isText(null));
    assert.isFalse(NodeType.isText(document.createElement('div')));
    assert.isFalse(NodeType.isText(document.createComment('x')));

    assert.isTrue(NodeType.isElement(document.createElement('div')));
    assert.isFalse(NodeType.isElement(null));
    assert.isFalse(NodeType.isElement(document.createTextNode('x')));
    assert.isFalse(NodeType.isElement(document.createComment('x')));

    assert.isTrue(NodeType.isComment(document.createComment('x')));
    assert.isFalse(NodeType.isComment(null));
    assert.isFalse(NodeType.isComment(document.createTextNode('x')));
    assert.isFalse(NodeType.isComment(document.createElement('div')));
  });

  it('isBr', () => {
    assert.isFalse(NodeType.isBr(null));
    assert.isFalse(NodeType.isBr(document.createTextNode('x')));
    assert.isTrue(NodeType.isBr(document.createElement('br')));
    assert.isFalse(NodeType.isBr(document.createComment('x')));
  });

  it('isContentEditableTrue', () => {
    assert.isFalse(NodeType.isContentEditableTrue(null));
    assert.isFalse(NodeType.isContentEditableTrue(document.createComment('x')));
    assert.isFalse(NodeType.isContentEditableTrue(document.createTextNode('x')));
    assert.isFalse(NodeType.isContentEditableTrue(document.createElement('div')));
    assert.isTrue(NodeType.isContentEditableTrue(SugarElement.fromHtml('<div contentEditable="true"></div>').dom));
    assert.isTrue(NodeType.isContentEditableTrue(SugarElement.fromHtml('<div contentEditable="trUe"></div>').dom));
    assert.isFalse(NodeType.isContentEditableTrue(SugarElement.fromHtml('<div contentEditable="false"></div>').dom));
    assert.isFalse(NodeType.isContentEditableTrue(SugarElement.fromHtml('<div contentEditable="fAlse"></div>').dom));
    assert.isFalse(NodeType.isContentEditableTrue(SugarElement.fromHtml('<div contentEditable="inherit"></div>').dom));
  });

  it('isContentEditableFalse', () => {
    assert.isFalse(NodeType.isContentEditableFalse(null));
    assert.isFalse(NodeType.isContentEditableFalse(document.createComment('x')));
    assert.isFalse(NodeType.isContentEditableFalse(document.createTextNode('x')));
    assert.isFalse(NodeType.isContentEditableFalse(document.createElement('div')));
    assert.isFalse(NodeType.isContentEditableFalse(SugarElement.fromHtml('<div contentEditable="true"></div>').dom));
    assert.isFalse(NodeType.isContentEditableFalse(SugarElement.fromHtml('<div contentEditable="trUe"></div>').dom));
    assert.isTrue(NodeType.isContentEditableFalse(SugarElement.fromHtml('<div contentEditable="false"></div>').dom));
    assert.isTrue(NodeType.isContentEditableFalse(SugarElement.fromHtml('<div contentEditable="fAlse"></div>').dom));
    assert.isFalse(NodeType.isContentEditableFalse(SugarElement.fromHtml('<div contentEditable="inherit"></div>').dom));
  });

  it('matchNodeNames', () => {
    const matchNodeNames = NodeType.matchNodeNames([ 'a', 'div', '#text' ]);

    assert.isFalse(matchNodeNames(null));
    assert.isTrue(matchNodeNames(document.createTextNode('x')));
    assert.isTrue(matchNodeNames(document.createElement('a')));
    assert.isTrue(matchNodeNames(document.createElement('div')));
    assert.isFalse(matchNodeNames(document.createElement('b')));
  });

  it('hasPropValue', () => {
    const hasTabIndex3 = NodeType.hasPropValue('tabIndex', 3);

    assert.isFalse(hasTabIndex3(null));
    assert.isTrue(hasTabIndex3(SugarElement.fromHtml('<div tabIndex="3"></div>').dom));
    assert.isFalse(hasTabIndex3(document.createElement('div')));
    assert.isFalse(hasTabIndex3(document.createElement('b')));
  });

  it('isBogus', () => {
    assert.isTrue(NodeType.isBogus(SugarElement.fromHtml('<div data-mce-bogus="1"></div>').dom));
    assert.isTrue(NodeType.isBogus(SugarElement.fromHtml('<div data-mce-bogus="all"></div>').dom));
    assert.isFalse(NodeType.isBogus(SugarElement.fromHtml('<div></div>').dom));
    assert.isFalse(NodeType.isBogus(document.createTextNode('test')));
    assert.isFalse(NodeType.isBogus(null));
  });

  it('isBogusAll', () => {
    assert.isFalse(NodeType.isBogusAll(SugarElement.fromHtml('<div data-mce-bogus="1"></div>').dom));
    assert.isTrue(NodeType.isBogusAll(SugarElement.fromHtml('<div data-mce-bogus="all"></div>').dom));
    assert.isFalse(NodeType.isBogusAll(SugarElement.fromHtml('<div></div>').dom));
    assert.isFalse(NodeType.isBogusAll(document.createTextNode('test')));
    assert.isFalse(NodeType.isBogusAll(null));
  });

  it('hasAttribute', () => {
    assert.isTrue(NodeType.hasAttribute('x')(SugarElement.fromHtml('<div x="1"></div>').dom));
    assert.isFalse(NodeType.hasAttribute('y')(SugarElement.fromHtml('<div x="1"></div>').dom));
  });

  it('isTable', () => {
    assert.isTrue(NodeType.isTable(SugarElement.fromHtml('<table><tr><td></td></tr></table>').dom));
    assert.isFalse(NodeType.isTable(SugarElement.fromHtml('<div></div>').dom));
    assert.isFalse(NodeType.isTable(document.createTextNode('test')));
    assert.isFalse(NodeType.isTable(null));
  });
});
