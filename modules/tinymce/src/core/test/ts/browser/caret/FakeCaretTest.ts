import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Env from 'tinymce/core/api/Env';
import { FakeCaret, isFakeCaretTarget } from 'tinymce/core/caret/FakeCaret';
import $ from 'tinymce/core/api/dom/DomQuery';
import Zwsp from 'tinymce/core/text/Zwsp';
import CaretAsserts from '../../module/test/CaretAsserts';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock-client';
import { Element } from '@ephox/sugar';
import { isFakeCaretTableBrowser } from 'tinymce/core/keyboard/TableNavigation';
import { Fun } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.core.caret.FakeCaretTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  let fakeCaret;

  if (!Env.ceFalse) {
    return;
  }

  const getRoot = function () {
    return viewBlock.get();
  };

  const mockEditor: any = {
    getParam: () => 'p'
  };

  const setup = function () {
    fakeCaret = FakeCaret(mockEditor, getRoot(), isBlock, Fun.constant(true));
  };

  const teardown = function () {
    fakeCaret.destroy();
  };

  const isBlock = function (node) {
    return node.nodeName === 'DIV';
  };

  suite.test('show/hide (before, block)', function () {
    let rng, $fakeCaretElm;

    $(getRoot()).html('<div>a</div>');

    rng = fakeCaret.show(true, $('div', getRoot())[0]);
    $fakeCaretElm = $(getRoot()).children();

    LegacyUnit.equal($fakeCaretElm[0].nodeName, 'P');
    LegacyUnit.equal($fakeCaretElm.attr('data-mce-caret'), 'before');
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretElm[0], 0, $fakeCaretElm[0], 0));

    fakeCaret.hide();
    LegacyUnit.equal($('*[data-mce-caret]', getRoot()).length, 0);
  });

  suite.test('show/hide (before, block)', function () {
    let rng, $fakeCaretElm;

    $(getRoot()).html('<div>a</div>');

    rng = fakeCaret.show(false, $('div', getRoot())[0]);
    $fakeCaretElm = $(getRoot()).children();

    LegacyUnit.equal($fakeCaretElm[1].nodeName, 'P');
    LegacyUnit.equal($fakeCaretElm.eq(1).attr('data-mce-caret'), 'after');
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretElm[1], 0, $fakeCaretElm[1], 0));

    fakeCaret.hide();
    LegacyUnit.equal($('*[data-mce-caret]', getRoot()).length, 0);
  });

  suite.test('show/hide (before, inline)', function () {
    let rng, $fakeCaretText;

    $(getRoot()).html('<span>a</span>');

    rng = fakeCaret.show(true, $('span', getRoot())[0]);
    $fakeCaretText = $(getRoot()).contents();

    LegacyUnit.equal($fakeCaretText[0].nodeName, '#text');
    LegacyUnit.equal($fakeCaretText[0].data, Zwsp.ZWSP);
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretText[0], 1));

    fakeCaret.hide();
    LegacyUnit.equal($(getRoot()).contents()[0].nodeName, 'SPAN');
  });

  suite.test('show/hide (after, inline)', function () {
    let rng, $fakeCaretText;

    $(getRoot()).html('<span>a</span>');

    rng = fakeCaret.show(false, $('span', getRoot())[0]);
    $fakeCaretText = $(getRoot()).contents();

    LegacyUnit.equal($fakeCaretText[1].nodeName, '#text');
    LegacyUnit.equal($fakeCaretText[1].data, Zwsp.ZWSP);
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretText[1], 1));

    fakeCaret.hide();
    LegacyUnit.equal($(getRoot()).contents()[0].nodeName, 'SPAN');
  });

  suite.test('getCss', function () {
    LegacyUnit.equal(fakeCaret.getCss().length > 10, true);
  });

  suite.test('show before TD', function () {
    let rng;

    getRoot().innerHTML = '<table><tr><td contenteditable="false">x</td></tr></table>';
    rng = fakeCaret.show(false, $('td', getRoot())[0]);
    LegacyUnit.equal(true, rng === null, 'Should be null since TD is not a valid caret target');
  });

  suite.test('show before TH', function () {
    let rng;

    getRoot().innerHTML = '<table><tr><th contenteditable="false">x</th></tr></table>';
    rng = fakeCaret.show(false, $('th', getRoot())[0]);
    LegacyUnit.equal(true, rng === null, 'Should be null since TH is not a valid caret target');
  });

  suite.test('isFakeCaretTarget', function () {
    LegacyUnit.equal(false, isFakeCaretTarget(Element.fromHtml('<p></p>').dom()), 'Should not need a fake caret');
    LegacyUnit.equal(true, isFakeCaretTarget(Element.fromHtml('<p contenteditable="false"></p>').dom()), 'Should always need a fake caret');
    LegacyUnit.equal(isFakeCaretTableBrowser(), isFakeCaretTarget(Element.fromHtml('<table></table>').dom()), 'Should on some browsers need a fake caret');
  });

  viewBlock.attach();
  setup();

  Pipeline.async({}, suite.toSteps({}), function () {
    viewBlock.detach();
    teardown();
    success();
  }, failure);
});
