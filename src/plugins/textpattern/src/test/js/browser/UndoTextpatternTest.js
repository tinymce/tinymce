asynctest(
  'browser.tinymce.plugins.textpattern.UndoTextpatternTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme',
    'tinymce.plugins.textpattern.Plugin'
  ],
  function (Pipeline, TinyLoader, ModernTheme, TextpatternPlugin) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    TextpatternPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {

      Pipeline.async({}, [

      ], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);