asynctest(
  'tinymce.plugins.paste.webdriver.CutTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RealMouse',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyUi',
    'tinymce.themes.modern.Theme',
    'tinymce.plugins.paste.Plugin'
  ],
  function (Pipeline, RealMouse, TinyLoader, TinyApis, TinyUi, Theme, PastePlugin) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();
    PastePlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var api = TinyApis(editor);
      var ui = TinyUi(editor);

      Pipeline.async({}, [
        api.sSetContent('<p>abc</p>'),
        api.sSetSelection([0, 0], 1, [0, 0], 2),
        ui.sClickOnMenu("Click Edit menu", 'button:contains("Edit")'),
        ui.sWaitForUi("Wait for dropdown", '.mce-floatpanel[role="application"]'),
        RealMouse.sClickOn('.mce-i-cut'),
        api.sAssertContent('<p>ac</p>')
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      plugins: 'paste'
    }, success, failure);
  }
);