import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import FocusManager from 'tinymce/core/api/FocusManager';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import FocusController from 'tinymce/core/focus/FocusController';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.focus.FocusControllerTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

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
    const noUiElm = DOMUtils.DOM.create('div', { class: 'mcey-abc' }, null);
    editor.settings.custom_ui_selector = '.mcex-abc';
    LegacyUnit.equal(FocusController.isUIElement(editor, uiElm1), true, 'Should be true since mce- is a ui prefix');
    LegacyUnit.equal(FocusController.isUIElement(editor, uiElm2), true, 'Should be true since mcex- is a ui prefix');
    LegacyUnit.equal(FocusController.isUIElement(editor, noUiElm), false, 'Should be true since mcey- is not a ui prefix');
    delete editor.settings.custom_ui_selector;
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    automatic_uploads: false,
    entities: 'raw',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
