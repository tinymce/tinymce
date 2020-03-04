import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import FocusManager from 'tinymce/core/api/FocusManager';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import * as FocusController from 'tinymce/core/focus/FocusController';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.focus.FocusControllerTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  suite.test('isEditorUIElement on valid element', function () {
    const uiElm = DOMUtils.DOM.create('div', { class: 'mce-abc' }, null);
    LegacyUnit.equal(FocusController.isEditorUIElement(uiElm), true, 'Should be true since mce- is a ui prefix');
  });

  suite.test('isEditorUIElement on invalid element', function () {
    const noUiElm = DOMUtils.DOM.create('div', { class: 'mcex-abc' }, null);
    LegacyUnit.equal(FocusController.isEditorUIElement(noUiElm), false, 'Should be true since mcex- is not a ui prefix');
  });

  suite.test('isEditorUIElement when api predicate is overwritten', function () {
    const customUiElm = DOMUtils.DOM.create('div', { class: 'abc' }, null);
    const customNoUiElm = DOMUtils.DOM.create('div', { class: 'x' }, null);

    const oldPredicate = FocusManager.isEditorUIElement;
    FocusManager.isEditorUIElement = function (elm) {
      return elm.className === 'abc';
    };

    LegacyUnit.equal(FocusController.isEditorUIElement(customUiElm), true, 'Should be true it is a valid ui element now');
    LegacyUnit.equal(FocusController.isEditorUIElement(customNoUiElm), false, 'Should be false since it not matching predicate');

    FocusManager.isEditorUIElement = oldPredicate;

    LegacyUnit.equal(FocusController.isEditorUIElement(customUiElm), false, 'Should be false since the predicate is restored');
  });

  suite.test('isUIElement on valid element', function (editor) {
    const uiElm1 = DOMUtils.DOM.create('div', { class: 'mce-abc' }, null);
    const uiElm2 = DOMUtils.DOM.create('div', { class: 'mcex-abc' }, null);
    const uiElm3 = DOMUtils.DOM.create('div', { class: 'tox-dialog' }, null);
    const noUiElm = DOMUtils.DOM.create('div', { class: 'mcey-abc' }, null);
    editor.settings.custom_ui_selector = '.mcex-abc';
    LegacyUnit.equal(FocusController.isUIElement(editor, uiElm1), true, 'Should be true since mce- is a ui prefix');
    LegacyUnit.equal(FocusController.isUIElement(editor, uiElm2), true, 'Should be true since mcex- is a ui prefix');
    LegacyUnit.equal(FocusController.isUIElement(editor, uiElm3), true, 'Should be true since tox- is a ui prefix');
    LegacyUnit.equal(FocusController.isUIElement(editor, noUiElm), false, 'Should be false since mcey- is not a ui prefix');
    delete editor.settings.custom_ui_selector;
  });

  suite.test('isEditorContentAreaElement on valid element', function () {
    const contentAreaElm1 = DOMUtils.DOM.create('div', { class: 'mce-content-body' }, null);
    const contentAreaElm2 = DOMUtils.DOM.create('div', { class: 'tox-edit-area__iframe' }, null);
    LegacyUnit.equal(FocusController.isEditorContentAreaElement(contentAreaElm1), true, 'Should be true since mce-content-body is a content area container element');
    LegacyUnit.equal(FocusController.isEditorContentAreaElement(contentAreaElm2), true, 'Should be true since tox-edit-area__iframe is content area container element');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    automatic_uploads: false,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
