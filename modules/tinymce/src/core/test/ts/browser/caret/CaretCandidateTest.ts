import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Env from 'tinymce/core/api/Env';
import * as CaretCandidate from 'tinymce/core/caret/CaretCandidate';
import $ from 'tinymce/core/api/dom/DomQuery';
import Zwsp from 'tinymce/core/text/Zwsp';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.CaretCandidateTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  if (!Env.ceFalse) {
    return;
  }

  const getRoot = function () {
    return viewBlock.get();
  };

  const setupHtml = function (html) {
    viewBlock.update(html);
  };

  suite.test('isCaretCandidate', function () {
    $.each('img input textarea hr table iframe video audio object'.split(' '), function (index, name) {
      LegacyUnit.equal(CaretCandidate.isCaretCandidate(document.createElement(name)), true);
    });

    LegacyUnit.equal(CaretCandidate.isCaretCandidate(document.createTextNode('text')), true);
    LegacyUnit.equal(CaretCandidate.isCaretCandidate($('<span contentEditable="false"></span>')[0]), true);
    LegacyUnit.equal(CaretCandidate.isCaretCandidate($('<span contentEditable="false" unselectable="true"></span>')[0]), false);
    LegacyUnit.equal(CaretCandidate.isCaretCandidate($('<div contentEditable="false"></div>')[0]), true);
    LegacyUnit.equal(CaretCandidate.isCaretCandidate($('<table><tr><td>X</td></tr></table>')[0]), true);
    LegacyUnit.equal(CaretCandidate.isCaretCandidate($('<span contentEditable="true"></span>')[0]), false);
    LegacyUnit.equal(CaretCandidate.isCaretCandidate($('<span></span>')[0]), false);
    LegacyUnit.equal(CaretCandidate.isCaretCandidate(document.createComment('text')), false);
    LegacyUnit.equal(CaretCandidate.isCaretCandidate($('<span data-mce-caret="1"></span>')[0]), false);
    LegacyUnit.equal(CaretCandidate.isCaretCandidate(document.createTextNode(Zwsp.ZWSP)), false);
  });

  suite.test('isInEditable', function () {
    setupHtml('abc<span contentEditable="true"><b><span contentEditable="false">X</span></b></span>');
    LegacyUnit.equal(CaretCandidate.isInEditable($('span span', getRoot())[0].firstChild, getRoot()), false);
    LegacyUnit.equal(CaretCandidate.isInEditable($('span span', getRoot())[0], getRoot()), true);
    LegacyUnit.equal(CaretCandidate.isInEditable($('span', getRoot())[0], getRoot()), true);
    LegacyUnit.equal(CaretCandidate.isInEditable(getRoot().firstChild, getRoot()), true);
  });

  suite.test('isAtomic', function () {
    $.each(['img', 'input', 'textarea', 'hr'], function (index, name) {
      LegacyUnit.equal(CaretCandidate.isAtomic(document.createElement(name)), true);
    });

    LegacyUnit.equal(CaretCandidate.isAtomic(document.createTextNode('text')), false);
    LegacyUnit.equal(CaretCandidate.isAtomic($('<table><tr><td>X</td></tr></table>')[0]), false);
    LegacyUnit.equal(CaretCandidate.isAtomic($('<span contentEditable="false">X</span>')[0]), true);
    LegacyUnit.equal(CaretCandidate.isAtomic(
      $('<span contentEditable="false">X<span contentEditable="true">Y</span>Z</span>')[0]), false
    );
  });

  suite.test('isEditableCaretCandidate', function () {
    setupHtml('abc<b>xx</b><span contentEditable="false"><span contentEditable="false">X</span></span>');
    LegacyUnit.equal(CaretCandidate.isEditableCaretCandidate(getRoot().firstChild, getRoot()), true);
    LegacyUnit.equal(CaretCandidate.isEditableCaretCandidate($('b', getRoot())[0]), false);
    LegacyUnit.equal(CaretCandidate.isEditableCaretCandidate($('span', getRoot())[0]), true);
    LegacyUnit.equal(CaretCandidate.isEditableCaretCandidate($('span span', getRoot())[0]), false);
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), function () {
    viewBlock.detach();
    success();
  }, failure);
});
