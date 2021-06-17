import { after, before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import $ from 'tinymce/core/api/dom/DomQuery';
import { FakeCaret, isFakeCaretTarget } from 'tinymce/core/caret/FakeCaret';
import { isFakeCaretTableBrowser } from 'tinymce/core/keyboard/TableNavigation';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as CaretAsserts from '../../module/test/CaretAsserts';
import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.caret.FakeCaretTest', () => {
  const viewBlock = ViewBlock.bddSetup();
  let fakeCaret: FakeCaret;

  const getRoot = viewBlock.get;

  before(() => {
    const mockEditor: any = {
      getParam: Fun.constant('p')
    };
    fakeCaret = FakeCaret(mockEditor, getRoot(), isBlock, Fun.always);
  });

  after(() => {
    fakeCaret.destroy();
  });

  const isBlock = (node: Node): node is HTMLDivElement => {
    return node.nodeName === 'DIV';
  };

  it('show/hide (before, block)', () => {
    $(getRoot()).html('<div>a</div>');

    const rng = fakeCaret.show(true, $<HTMLDivElement>('div', getRoot())[0]);
    const $fakeCaretElm = $(getRoot()).children();

    assert.equal($fakeCaretElm[0].nodeName, 'P');
    assert.equal($fakeCaretElm.attr('data-mce-caret'), 'before');
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretElm[0], 0, $fakeCaretElm[0], 0));

    fakeCaret.hide();
    assert.lengthOf($('*[data-mce-caret]', getRoot()), 0);
  });

  it('show/hide (after, block)', () => {
    $(getRoot()).html('<div>a</div>');

    const rng = fakeCaret.show(false, $<HTMLDivElement>('div', getRoot())[0]);
    const $fakeCaretElm = $(getRoot()).children();

    assert.equal($fakeCaretElm[1].nodeName, 'P');
    assert.equal($fakeCaretElm.eq(1).attr('data-mce-caret'), 'after');
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretElm[1], 0, $fakeCaretElm[1], 0));

    fakeCaret.hide();
    assert.lengthOf($('*[data-mce-caret]', getRoot()), 0);
  });

  it('show/hide (before, inline)', () => {
    $(getRoot()).html('<span>a</span>');

    const rng = fakeCaret.show(true, $<HTMLSpanElement>('span', getRoot())[0]);
    const $fakeCaretText = $(getRoot()).contents();

    assert.equal($fakeCaretText[0].nodeName, '#text');
    assert.equal(($fakeCaretText[0] as Text).data, Zwsp.ZWSP);
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretText[0], 1));

    fakeCaret.hide();
    assert.equal($(getRoot()).contents()[0].nodeName, 'SPAN');
  });

  it('show/hide (after, inline)', () => {
    $(getRoot()).html('<span>a</span>');

    const rng = fakeCaret.show(false, $<HTMLSpanElement>('span', getRoot())[0]);
    const $fakeCaretText = $(getRoot()).contents();

    assert.equal($fakeCaretText[1].nodeName, '#text');
    assert.equal(($fakeCaretText[1] as Text).data, Zwsp.ZWSP);
    CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretText[1], 1));

    fakeCaret.hide();
    assert.equal($(getRoot()).contents()[0].nodeName, 'SPAN');
  });

  it('getCss', () => {
    assert.isAbove(fakeCaret.getCss().length, 10);
  });

  it('show before TD', () => {
    getRoot().innerHTML = '<table><tr><td contenteditable="false">x</td></tr></table>';
    const rng = fakeCaret.show(false, $<HTMLTableCellElement>('td', getRoot())[0]);
    assert.isNull(rng, 'Should be null since TD is not a valid caret target');
  });

  it('show before TH', () => {
    getRoot().innerHTML = '<table><tr><th contenteditable="false">x</th></tr></table>';
    const rng = fakeCaret.show(false, $<HTMLTableCellElement>('th', getRoot())[0]);
    assert.isNull(rng, 'Should be null since TH is not a valid caret target');
  });

  it('isFakeCaretTarget', () => {
    assert.isFalse(isFakeCaretTarget(SugarElement.fromHtml('<p></p>').dom), 'Should not need a fake caret');
    assert.isTrue(isFakeCaretTarget(SugarElement.fromHtml('<p contenteditable="false"></p>').dom), 'Should always need a fake caret');
    assert.equal(isFakeCaretTarget(SugarElement.fromHtml('<table></table>').dom), isFakeCaretTableBrowser(), 'Should on some browsers need a fake caret');
  });
});
