import { after, before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, Html, SelectorFilter, SelectorFind, SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { FakeCaret, isFakeCaretTarget } from 'tinymce/core/caret/FakeCaret';
import { isFakeCaretTableBrowser } from 'tinymce/core/keyboard/TableNavigation';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as CaretAsserts from '../../module/test/CaretAsserts';
import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.caret.FakeCaretTest', () => {
  const viewBlock = ViewBlock.bddSetup();
  let fakeCaret: FakeCaret;

  const getRoot = () => SugarElement.fromDom(viewBlock.get());

  before(() => {
    const mockEditor: any = {
      options: {
        get: Fun.constant('p')
      },
      dom: DOMUtils(document)
    };
    fakeCaret = FakeCaret(mockEditor, getRoot().dom, isBlock, Fun.always);
  });

  after(() => {
    fakeCaret.destroy();
  });

  const isBlock = (node: Node): node is HTMLDivElement => {
    return node.nodeName === 'DIV';
  };

  it('show/hide (before, block)', () => {
    Html.set(getRoot(), '<div>a</div>');

    const rng = fakeCaret.show(true, SelectorFind.descendant(getRoot(), 'div').getOrDie().dom);
    const fakeCaretElm = Traverse.children(getRoot())[0] as SugarElement<HTMLElement>;

    assert.equal(SugarNode.name(fakeCaretElm), 'p');
    assert.equal(Attribute.get(fakeCaretElm, 'data-mce-caret'), 'before');
    CaretAsserts.assertRange(rng, CaretAsserts.createRange(fakeCaretElm.dom, 0, fakeCaretElm.dom, 0));

    fakeCaret.hide();
    assert.lengthOf(SelectorFilter.descendants(getRoot(), '*[data-mce-caret]'), 0);
  });

  it('show/hide (after, block)', () => {
    Html.set(getRoot(), '<div>a</div>');

    const rng = fakeCaret.show(false, SelectorFind.descendant(getRoot(), 'div').getOrDie().dom);
    const fakeCaretElm = Traverse.children(getRoot())[1] as SugarElement<HTMLElement>;

    assert.equal(SugarNode.name(fakeCaretElm), 'p');
    assert.equal(Attribute.get(fakeCaretElm, 'data-mce-caret'), 'after');
    CaretAsserts.assertRange(rng, CaretAsserts.createRange(fakeCaretElm.dom, 0, fakeCaretElm.dom, 0));

    fakeCaret.hide();
    assert.lengthOf(SelectorFilter.descendants(getRoot(), '*[data-mce-caret]'), 0);
  });

  it('show/hide (before, inline)', () => {
    Html.set(getRoot(), '<span>a</span>');

    const rng = fakeCaret.show(true, SelectorFind.descendant(getRoot(), 'span').getOrDie().dom);
    const fakeCaretText = Traverse.children(getRoot());

    assert.equal(SugarNode.name(fakeCaretText[0]), '#text');
    assert.equal((fakeCaretText[0].dom as Text).data, Zwsp.ZWSP);
    CaretAsserts.assertRange(rng, CaretAsserts.createRange(fakeCaretText[0].dom, 1));

    fakeCaret.hide();
    assert.equal(Traverse.children(getRoot())[0].dom.nodeName, 'SPAN');
  });

  it('show/hide (after, inline)', () => {
    Html.set(getRoot(), '<span>a</span>');

    const rng = fakeCaret.show(false, SelectorFind.descendant(getRoot(), 'span').getOrDie().dom);
    const fakeCaretText = Traverse.children(getRoot());

    assert.equal(SugarNode.name(fakeCaretText[1]), '#text');
    assert.equal((fakeCaretText[1].dom as Text).data, Zwsp.ZWSP);
    CaretAsserts.assertRange(rng, CaretAsserts.createRange(fakeCaretText[1].dom, 1));

    fakeCaret.hide();
    assert.equal(Traverse.children(getRoot())[0].dom.nodeName, 'SPAN');
  });

  it('getCss', () => {
    assert.isAbove(fakeCaret.getCss().length, 10);
  });

  it('show before TD', () => {
    getRoot().dom.innerHTML = '<table><tr><td contenteditable="false">x</td></tr></table>';
    const rng = fakeCaret.show(false, SelectorFind.descendant(getRoot(), 'td').getOrDie().dom);
    assert.isNull(rng, 'Should be null since TD is not a valid caret target');
  });

  it('show before TH', () => {
    getRoot().dom.innerHTML = '<table><tr><th contenteditable="false">x</th></tr></table>';
    const rng = fakeCaret.show(false, SelectorFind.descendant(getRoot(), 'th').getOrDie().dom);
    assert.isNull(rng, 'Should be null since TH is not a valid caret target');
  });

  it('isFakeCaretTarget', () => {
    assert.isFalse(isFakeCaretTarget(SugarElement.fromHtml('<p></p>').dom), 'Should not need a fake caret');
    assert.isTrue(isFakeCaretTarget(SugarElement.fromHtml('<p contenteditable="false"></p>').dom), 'Should always need a fake caret');
    assert.equal(isFakeCaretTarget(SugarElement.fromHtml('<table></table>').dom), isFakeCaretTableBrowser(), 'Should on some browsers need a fake caret');
  });
});
