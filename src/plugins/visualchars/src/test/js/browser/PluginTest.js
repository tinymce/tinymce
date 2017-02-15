asynctest(
  'browser.tinymce.plugins.visualchars.PluginTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.visualchars.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, Plugin, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Plugin();
    Theme();

    suite.test('Visualchar toggle on/off', function (editor) {
      editor.setContent('<p>a&nbsp;&nbsp;b</p>');
      LegacyUnit.equal(0, editor.dom.select('span').length);
      editor.execCommand('mceVisualChars');
      LegacyUnit.equal('<p>a&nbsp;&nbsp;b</p>', editor.getContent());
      LegacyUnit.equal(2, editor.dom.select('span').length);
      editor.execCommand('mceVisualChars');
      LegacyUnit.equal(0, editor.dom.select('span').length);
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      plugins: 'visualchars',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
