asynctest(
  'browser.tinymce.core.EditorRtlTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'global!document',
    'tinymce.core.dom.ScriptLoader',
    'tinymce.core.EditorManager',
    'tinymce.core.InsertContent',
    'tinymce.core.ui.Factory',
    'tinymce.core.util.I18n',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, document, ScriptLoader, EditorManager, InsertContent, Factory, I18n, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    var teardown = function () {
      I18n.rtl = false;
      I18n.setCode('en');
      Factory.get('Control').rtl = false;
    };

    suite.test('UI rendered in RTL mode', function () {
      LegacyUnit.equal(EditorManager.activeEditor.getContainer().className.indexOf('mce-rtl') !== -1, true, 'Should have a mce-rtl class');
      LegacyUnit.equal(EditorManager.activeEditor.rtl, true, 'Should have the rtl property set');
    });

    EditorManager.addI18n('ar', {
      "Bold": "Bold test",
      "_dir": "rtl"
    });

    // Prevents the arabic language pack from being loaded
    EditorManager.overrideDefaults({
      base_url: '/project/tinymce'
    });
    ScriptLoader.ScriptLoader.markDone('http://' + document.location.host + '/project/tinymce/langs/ar.js');

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), function () {
        teardown();
        onSuccess();
      }, onFailure);
    }, {
      language: 'ar',
      selector: "textarea",
      add_unload_trigger: false,
      disable_nodechange: true,
      entities: 'raw',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
