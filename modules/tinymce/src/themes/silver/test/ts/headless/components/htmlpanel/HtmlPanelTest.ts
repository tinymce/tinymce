import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { renderHtmlPanel } from 'tinymce/themes/silver/ui/general/HtmlPanel';

import TestBackstage from '../../../module/TestBackstage';

describe('headless.tinymce.themes.silver.components.htmlpanel.HtmlPanelTest', () => {
  const innerHtml = '<br><br><hr>';

  const assertPanelStructure = (hook: TestHelpers.GuiSetup.Hook<SugarElement<Document>>, role: string, stretched: boolean) => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, _arr) => s.element('div', {
        attrs: {
          role: str.is(role),
          class: str.is(stretched ? 'tox-form__group tox-form__group--stretched' : 'tox-form__group')
        },
        children: [
          s.element('br', {}),
          s.element('br', {}),
          s.element('hr', {})
        ]
      })),
      hook.component().element
    );
  };

  context('Presentation', () => {
    const initEl = Singleton.value<HTMLElement>();
    const backstage = TestBackstage();
    const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderHtmlPanel({
        html: innerHtml,
        presets: 'presentation',
        onInit: (el) => initEl.set(el),
        stretched: false
      }, backstage.shared.providers)
    ));

    it('Check basic structure', () => {
      assertPanelStructure(hook, 'presentation', false);
      assert.equal(initEl.get().getOrDie(), hook.component().element.dom, 'Should call onInit with component element');
    });
  });

  context('Presentation stretched', () => {
    const initEl = Singleton.value<HTMLElement>();
    const backstage = TestBackstage();
    const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderHtmlPanel({
        html: innerHtml,
        presets: 'presentation',
        onInit: (el) => initEl.set(el),
        stretched: true
      }, backstage.shared.providers)
    ));

    it('Check basic structure', () => {
      assertPanelStructure(hook, 'presentation', true);
      assert.equal(initEl.get().getOrDie(), hook.component().element.dom, 'Should call onInit with component element');
    });
  });

  context('Document', () => {
    const initEl = Singleton.value<HTMLElement>();
    const backstage = TestBackstage();
    const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderHtmlPanel({
        html: innerHtml,
        presets: 'document',
        onInit: (el) => initEl.set(el),
        stretched: false
      }, backstage.shared.providers)
    ));

    it('Check basic structure', () => {
      assertPanelStructure(hook, 'document', false);
      assert.equal(initEl.get().getOrDie(), hook.component().element.dom, 'Should call onInit with component element');
    });
  });

  context('Document stretched', () => {
    const initEl = Singleton.value<HTMLElement>();
    const backstage = TestBackstage();
    const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderHtmlPanel({
        html: innerHtml,
        presets: 'document',
        onInit: (el) => initEl.set(el),
        stretched: true
      }, backstage.shared.providers)
    ));

    it('Check basic structure', () => {
      assertPanelStructure(hook, 'document', true);
      assert.equal(initEl.get().getOrDie(), hook.component().element.dom, 'Should call onInit with component element');
    });
  });
});
