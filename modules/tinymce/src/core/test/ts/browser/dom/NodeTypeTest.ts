import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import $ from 'tinymce/core/api/dom/DomQuery';
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
    assert.isTrue(NodeType.isContentEditableTrue($('<div contentEditable="true"></div>')[0]));
    assert.isTrue(NodeType.isContentEditableTrue($('<div contentEditable="trUe"></div>')[0]));
    assert.isFalse(NodeType.isContentEditableTrue($('<div contentEditable="false"></div>')[0]));
    assert.isFalse(NodeType.isContentEditableTrue($('<div contentEditable="fAlse"></div>')[0]));
    assert.isFalse(NodeType.isContentEditableTrue($('<div contentEditable="inherit"></div>')[0]));
  });

  it('isContentEditableFalse', () => {
    assert.isFalse(NodeType.isContentEditableFalse(null));
    assert.isFalse(NodeType.isContentEditableFalse(document.createComment('x')));
    assert.isFalse(NodeType.isContentEditableFalse(document.createTextNode('x')));
    assert.isFalse(NodeType.isContentEditableFalse(document.createElement('div')));
    assert.isFalse(NodeType.isContentEditableFalse($('<div contentEditable="true"></div>')[0]));
    assert.isFalse(NodeType.isContentEditableFalse($('<div contentEditable="trUe"></div>')[0]));
    assert.isTrue(NodeType.isContentEditableFalse($('<div contentEditable="false"></div>')[0]));
    assert.isTrue(NodeType.isContentEditableFalse($('<div contentEditable="fAlse"></div>')[0]));
    assert.isFalse(NodeType.isContentEditableFalse($('<div contentEditable="inherit"></div>')[0]));
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
    assert.isTrue(hasTabIndex3($('<div tabIndex="3"></div>')[0]));
    assert.isFalse(hasTabIndex3(document.createElement('div')));
    assert.isFalse(hasTabIndex3(document.createElement('b')));
  });

  it('isBogus', () => {
    assert.isTrue(NodeType.isBogus($('<div data-mce-bogus="1"></div>')[0]));
    assert.isTrue(NodeType.isBogus($('<div data-mce-bogus="all"></div>')[0]));
    assert.isFalse(NodeType.isBogus($('<div></div>')[0]));
    assert.isFalse(NodeType.isBogus(document.createTextNode('test')));
    assert.isFalse(NodeType.isBogus(null));
  });

  it('isBogusAll', () => {
    assert.isFalse(NodeType.isBogusAll($('<div data-mce-bogus="1"></div>')[0]));
    assert.isTrue(NodeType.isBogusAll($('<div data-mce-bogus="all"></div>')[0]));
    assert.isFalse(NodeType.isBogusAll($('<div></div>')[0]));
    assert.isFalse(NodeType.isBogusAll(document.createTextNode('test')));
    assert.isFalse(NodeType.isBogusAll(null));
  });

  it('hasAttribute', () => {
    assert.isTrue(NodeType.hasAttribute('x')($('<div x="1"></div>')[0]));
    assert.isFalse(NodeType.hasAttribute('y')($('<div x="1"></div>')[0]));
  });

  it('isTable', () => {
    assert.isTrue(NodeType.isTable($('<table><tr><td></td></tr></table>')[0]));
    assert.isFalse(NodeType.isTable($('<div></div>')[0]));
    assert.isFalse(NodeType.isTable(document.createTextNode('test')));
    assert.isFalse(NodeType.isTable(null));
  });
});
