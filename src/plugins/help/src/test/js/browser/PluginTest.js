asynctest(
  'browser.plugin.PluginTest',
  [
    'tinymce.plugins.help.Plugin',
    'ephox.mcagar.api.TinyLoader',
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyUi',
    'tinymce.themes.modern.Theme'
  ],
  function (Plugin, TinyLoader, Pipeline, TinyApis, TinyUi, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        tinyUi.sClickOnToolbar('click on button', 'button'),
        tinyUi.sWaitForPopup('Wait for dialog popup', 'div.mce-title > img')
      ], onSuccess, onFailure);
    }, {
      plugins: 'help',
      toolbar: 'help',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
