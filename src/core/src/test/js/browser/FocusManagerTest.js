asynctest(
  'browser.tinymce.core.FormattingCommandsTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.FocusManager',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, DOMUtils, FocusManager, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    suite.test('isEditorUIElement on valid element', function () {
      var uiElm = DOMUtils.DOM.create('div', { 'class': 'mce-abc' }, null);
      LegacyUnit.equal(FocusManager.isEditorUIElement(uiElm), true, 'Should be true since mce- is a ui prefix');
    });

    suite.test('isEditorUIElement on invalid element', function () {
      var noUiElm = DOMUtils.DOM.create('div', { 'class': 'mcex-abc' }, null);
      LegacyUnit.equal(FocusManager.isEditorUIElement(noUiElm), false, 'Should be true since mcex- is not a ui prefix');
    });

    suite.test('_isUIElement on valid element', function (editor) {
      var uiElm1 = DOMUtils.DOM.create('div', { 'class': 'mce-abc' }, null);
      var uiElm2 = DOMUtils.DOM.create('div', { 'class': 'mcex-abc' }, null);
      var noUiElm = DOMUtils.DOM.create('div', { 'class': 'mcey-abc' }, null);
      editor.settings.custom_ui_selector = '.mcex-abc';
      LegacyUnit.equal(FocusManager._isUIElement(editor, uiElm1), true, 'Should be true since mce- is a ui prefix');
      LegacyUnit.equal(FocusManager._isUIElement(editor, uiElm2), true, 'Should be true since mcex- is a ui prefix');
      LegacyUnit.equal(FocusManager._isUIElement(editor, noUiElm), false, 'Should be true since mcey- is not a ui prefix');
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
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);