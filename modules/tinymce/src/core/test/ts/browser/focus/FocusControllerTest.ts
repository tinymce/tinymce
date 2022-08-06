import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import FocusManager from 'tinymce/core/api/FocusManager';
import * as FocusController from 'tinymce/core/focus/FocusController';

describe('browser.tinymce.core.focus.FocusControllerTest', () => {
  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetup },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot }
  ], (tester) => {
    context(tester.label, () => {
      const hook = tester.setup<Editor>({
        add_unload_trigger: false,
        disable_nodechange: true,
        automatic_uploads: false,
        entities: 'raw',
        indent: false,
        base_url: '/project/tinymce/js/tinymce'
      }, []);

      it('isEditorUIElement on valid element', () => {
        const uiElm = DOMUtils.DOM.create('div', { class: 'mce-abc' }, null);
        assert.isTrue(FocusController.isEditorUIElement(uiElm), 'Should be true since mce- is a ui prefix');
      });

      it('isEditorUIElement on invalid element', () => {
        const noUiElm = DOMUtils.DOM.create('div', { class: 'mcex-abc' }, null);
        assert.isFalse(FocusController.isEditorUIElement(noUiElm), 'Should be true since mcex- is not a ui prefix');
      });

      it('isEditorUIElement when api predicate is overwritten', () => {
        const customUiElm = DOMUtils.DOM.create('div', { class: 'abc' }, null);
        const customNoUiElm = DOMUtils.DOM.create('div', { class: 'x' }, null);

        const oldPredicate = FocusManager.isEditorUIElement;
        FocusManager.isEditorUIElement = (elm) => {
          return elm.className === 'abc';
        };

        assert.isTrue(FocusController.isEditorUIElement(customUiElm), 'Should be true it is a valid ui element now');
        assert.isFalse(FocusController.isEditorUIElement(customNoUiElm), 'Should be false since it not matching predicate');

        FocusManager.isEditorUIElement = oldPredicate;

        assert.isFalse(FocusController.isEditorUIElement(customUiElm), 'Should be false since the predicate is restored');
      });

      it('isUIElement on valid element', () => {
        const editor = hook.editor();
        const uiElm1 = DOMUtils.DOM.create('div', { class: 'mce-abc' }, null);
        const uiElm2 = DOMUtils.DOM.create('div', { class: 'mcex-abc' }, null);
        const uiElm3 = DOMUtils.DOM.create('div', { class: 'tox-dialog' }, null);
        const noUiElm = DOMUtils.DOM.create('div', { class: 'mcey-abc' }, null);
        editor.options.set('custom_ui_selector', '.mcex-abc');
        assert.isTrue(FocusController.isUIElement(editor, uiElm1), 'Should be true since mce- is a ui prefix');
        assert.isTrue(FocusController.isUIElement(editor, uiElm2), 'Should be true since mcex- is a ui prefix');
        assert.isTrue(FocusController.isUIElement(editor, uiElm3), 'Should be true since tox- is a ui prefix');
        assert.isFalse(FocusController.isUIElement(editor, noUiElm), 'Should be false since mcey- is not a ui prefix');
        editor.options.unset('custom_ui_selector');
      });

      it('isEditorContentAreaElement on valid element', () => {
        const contentAreaElm1 = DOMUtils.DOM.create('div', { class: 'mce-content-body' }, null);
        const contentAreaElm2 = DOMUtils.DOM.create('div', { class: 'tox-edit-area__iframe' }, null);
        assert.isTrue(FocusController.isEditorContentAreaElement(contentAreaElm1), 'Should be true since mce-content-body is a content area container element');
        assert.isTrue(FocusController.isEditorContentAreaElement(contentAreaElm2), 'Should be true since tox-edit-area__iframe is content area container element');
      });

      it('isUIElement on editor sibling is false', () => {
        const editor = hook.editor();
        const inputElm = DOMUtils.DOM.create('input', { }, null);
        editor.getContainer().parentNode?.appendChild(inputElm);
        assert.isFalse(FocusController.isUIElement(editor, inputElm), 'Should be false as not sitting inside editor');
        DOMUtils.DOM.remove(inputElm);
      });
    });
  });
});
