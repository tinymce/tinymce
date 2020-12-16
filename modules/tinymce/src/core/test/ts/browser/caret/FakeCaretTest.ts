import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import $ from 'tinymce/core/api/dom/DomQuery';
import Env from 'tinymce/core/api/Env';
import { FakeCaret, isFakeCaretTarget } from 'tinymce/core/caret/FakeCaret';
import { isFakeCaretTableBrowser } from 'tinymce/core/keyboard/TableNavigation';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import * as CaretAsserts from '../../module/test/CaretAsserts';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.caret.FakeCaretTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  let fakeCaret;

  if (!Env.ceFalse) {
    return;
  }

  const getRoot = () => {
    return viewBlock.get();
  };

  const mockEditor: any = {
    getParam: () => 'p'
  };

  const setup = () => {
    fakeCaret = FakeCaret(mockEditor, getRoot(), isBlock, Fun.always);
  };

  const teardown = () => {
    fakeCaret.destroy();
  };

  const isBlock = (node) => {
    return node.nodeName === 'DIV';
  };

  suite.test('show/hide (before, block)', () => {
    $(getRoot()).html('<div>a</div>');

    const rng = fakeCaret.show(true, $('div', getRoot())[0]);
    const $fakeCaretElm = $(getRoot()).children();

    LegacyUnit.equal($fakeCaretElm[0].nodeName, 'P');
    LegacyUnit.equal($fakeCaretElm.attr('data-mce-caret'), 'before');
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretElm[0], 0, $fakeCaretElm[0], 0));

    fakeCaret.hide();
    LegacyUnit.equal($('*[data-mce-caret]', getRoot()).length, 0);
  });

  suite.test('show/hide (before, block)', () => {
    $(getRoot()).html('<div>a</div>');

    const rng = fakeCaret.show(false, $('div', getRoot())[0]);
    const $fakeCaretElm = $(getRoot()).children();

    LegacyUnit.equal($fakeCaretElm[1].nodeName, 'P');
    LegacyUnit.equal($fakeCaretElm.eq(1).attr('data-mce-caret'), 'after');
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretElm[1], 0, $fakeCaretElm[1], 0));

    fakeCaret.hide();
    LegacyUnit.equal($('*[data-mce-caret]', getRoot()).length, 0);
  });

  suite.test('show/hide (before, inline)', () => {
    $(getRoot()).html('<span>a</span>');

    const rng = fakeCaret.show(true, $('span', getRoot())[0]);
    const $fakeCaretText = $(getRoot()).contents();

    LegacyUnit.equal($fakeCaretText[0].nodeName, '#text');
    LegacyUnit.equal(($fakeCaretText[0] as Text).data, Zwsp.ZWSP);
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretText[0], 1));

    fakeCaret.hide();
    LegacyUnit.equal($(getRoot()).contents()[0].nodeName, 'SPAN');
  });

  suite.test('show/hide (after, inline)', () => {
    $(getRoot()).html('<span>a</span>');

    const rng = fakeCaret.show(false, $('span', getRoot())[0]);
    const $fakeCaretText = $(getRoot()).contents();

    LegacyUnit.equal($fakeCaretText[1].nodeName, '#text');
    LegacyUnit.equal(($fakeCaretText[1] as Text).data, Zwsp.ZWSP);
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretText[1], 1));

    fakeCaret.hide();
    LegacyUnit.equal($(getRoot()).contents()[0].nodeName, 'SPAN');
  });

  suite.test('getCss', () => {
    LegacyUnit.equal(fakeCaret.getCss().length > 10, true);
  });

  suite.test('show before TD', () => {
    getRoot().innerHTML = '<table><tr><td contenteditable="false">x</td></tr></table>';
    const rng = fakeCaret.show(false, $('td', getRoot())[0]);
    LegacyUnit.equal(true, rng === null, 'Should be null since TD is not a valid caret target');
  });

  suite.test('show before TH', () => {
    getRoot().innerHTML = '<table><tr><th contenteditable="false">x</th></tr></table>';
    const rng = fakeCaret.show(false, $('th', getRoot())[0]);
    LegacyUnit.equal(true, rng === null, 'Should be null since TH is not a valid caret target');
  });

  suite.test('isFakeCaretTarget', () => {
    LegacyUnit.equal(false, isFakeCaretTarget(SugarElement.fromHtml('<p></p>').dom), 'Should not need a fake caret');
    LegacyUnit.equal(true, isFakeCaretTarget(SugarElement.fromHtml('<p contenteditable="false"></p>').dom), 'Should always need a fake caret');
    LegacyUnit.equal(isFakeCaretTableBrowser(), isFakeCaretTarget(SugarElement.fromHtml('<table></table>').dom), 'Should on some browsers need a fake caret');
  });

  viewBlock.attach();
  setup();

  Pipeline.async({}, suite.toSteps({}), () => {
    viewBlock.detach();
    teardown();
    success();
  }, failure);
});
