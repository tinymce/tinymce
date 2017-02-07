asynctest(
  'browser.tinymce.plugins.visualchars.PluginTest',
  [
    'tinymce.plugins.visualchars.Plugin',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'ephox.agar.api.Pipeline'
  ],
  function (
    Plugin, LegacyUnit, TinyLoader, Pipeline
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

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
      plugins: 'visualchars'
    }, success, failure);
  }
);
