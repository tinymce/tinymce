import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import NodeType from 'tinymce/core/dom/NodeType';
import $ from 'tinymce/core/api/dom/DomQuery';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.dom.NodeTypeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  suite.test('isText/isElement/isComment', function () {
    LegacyUnit.strictEqual(NodeType.isText(document.createTextNode('x')), true);
    LegacyUnit.strictEqual(NodeType.isText(null), false);
    LegacyUnit.strictEqual(NodeType.isText(document.createElement('div')), false);
    LegacyUnit.strictEqual(NodeType.isText(document.createComment('x')), false);

    LegacyUnit.strictEqual(NodeType.isElement(document.createElement('div')), true);
    LegacyUnit.strictEqual(NodeType.isElement(null), false);
    LegacyUnit.strictEqual(NodeType.isElement(document.createTextNode('x')), false);
    LegacyUnit.strictEqual(NodeType.isElement(document.createComment('x')), false);

    LegacyUnit.strictEqual(NodeType.isComment(document.createComment('x')), true);
    LegacyUnit.strictEqual(NodeType.isComment(null), false);
    LegacyUnit.strictEqual(NodeType.isComment(document.createTextNode('x')), false);
    LegacyUnit.strictEqual(NodeType.isComment(document.createElement('div')), false);
  });

  suite.test('isBr', function () {
    LegacyUnit.strictEqual(NodeType.isBr(null), false);
    LegacyUnit.strictEqual(NodeType.isBr(document.createTextNode('x')), false);
    LegacyUnit.strictEqual(NodeType.isBr(document.createElement('br')), true);
    LegacyUnit.strictEqual(NodeType.isBr(document.createComment('x')), false);
  });

  suite.test('isContentEditableTrue', function () {
    LegacyUnit.strictEqual(NodeType.isContentEditableTrue(null), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableTrue(document.createComment('x')), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableTrue(document.createTextNode('x')), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableTrue(document.createElement('div')), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="true"></div>')[0]), true);
    LegacyUnit.strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="trUe"></div>')[0]), true);
    LegacyUnit.strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="false"></div>')[0]), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="fAlse"></div>')[0]), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="inherit"></div>')[0]), false);
  });

  suite.test('isContentEditableFalse', function () {
    LegacyUnit.strictEqual(NodeType.isContentEditableFalse(null), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableFalse(document.createComment('x')), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableFalse(document.createTextNode('x')), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableFalse(document.createElement('div')), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="true"></div>')[0]), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="trUe"></div>')[0]), false);
    LegacyUnit.strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="false"></div>')[0]), true);
    LegacyUnit.strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="fAlse"></div>')[0]), true);
    LegacyUnit.strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="inherit"></div>')[0]), false);
  });

  suite.test('matchNodeNames', function () {
    const matchNodeNames = NodeType.matchNodeNames(['a', 'div', '#text']);

    LegacyUnit.strictEqual(matchNodeNames(null), false);
    LegacyUnit.strictEqual(matchNodeNames(document.createTextNode('x')), true);
    LegacyUnit.strictEqual(matchNodeNames(document.createElement('a')), true);
    LegacyUnit.strictEqual(matchNodeNames(document.createElement('div')), true);
    LegacyUnit.strictEqual(matchNodeNames(document.createElement('b')), false);
  });

  suite.test('hasPropValue', function () {
    const hasTabIndex3 = NodeType.hasPropValue('tabIndex', 3);

    LegacyUnit.strictEqual(hasTabIndex3(null), false);
    LegacyUnit.strictEqual(hasTabIndex3($('<div tabIndex="3"></div>')[0]), true);
    LegacyUnit.strictEqual(hasTabIndex3(document.createElement('div')), false);
    LegacyUnit.strictEqual(hasTabIndex3(document.createElement('b')), false);
  });

  suite.test('isBogus', function () {
    LegacyUnit.strictEqual(NodeType.isBogus($('<div data-mce-bogus="1"></div>')[0]), true);
    LegacyUnit.strictEqual(NodeType.isBogus($('<div data-mce-bogus="all"></div>')[0]), true);
    LegacyUnit.strictEqual(NodeType.isBogus($('<div></div>')[0]), false);
    LegacyUnit.strictEqual(NodeType.isBogus(document.createTextNode('test')), false);
    LegacyUnit.strictEqual(NodeType.isBogus(null), false);
  });

  suite.test('isBogusAll', function () {
    LegacyUnit.strictEqual(NodeType.isBogusAll($('<div data-mce-bogus="1"></div>')[0]), false);
    LegacyUnit.strictEqual(NodeType.isBogusAll($('<div data-mce-bogus="all"></div>')[0]), true);
    LegacyUnit.strictEqual(NodeType.isBogusAll($('<div></div>')[0]), false);
    LegacyUnit.strictEqual(NodeType.isBogusAll(document.createTextNode('test')), false);
    LegacyUnit.strictEqual(NodeType.isBogusAll(null), false);
  });

  suite.test('hasAttribute', function () {
    LegacyUnit.strictEqual(NodeType.hasAttribute('x')($('<div x="1"></div>')[0]), true);
    LegacyUnit.strictEqual(NodeType.hasAttribute('y')($('<div x="1"></div>')[0]), false);
  });

  suite.test('isTable', function () {
    LegacyUnit.strictEqual(NodeType.isTable($('<table><tr><td></td></tr></table>')[0]), true);
    LegacyUnit.strictEqual(NodeType.isTable($('<div></div>')[0]), false);
    LegacyUnit.strictEqual(NodeType.isTable(document.createTextNode('test')), false);
    LegacyUnit.strictEqual(NodeType.isTable(null), false);
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
