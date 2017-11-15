asynctest(
  'browser.tinymce.plugins.charmap.InsertQuotationMarkTest',
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.charmap.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Chain, Mouse, Pipeline, UiFinder, TinyApis, TinyLoader, TinyUi, CharmapPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    CharmapPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        tinyUi.sClickOnToolbar('click charmap', 'div[aria-label="Special character"] button'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"]'),
          UiFinder.cFindIn('div[title="quotation mark"]'),
          Mouse.cClick
        ]),
        tinyApis.sAssertContent('<p>"</p>')

      ], onSuccess, onFailure);
    }, {
      plugins: 'charmap',
      toolbar: 'charmap',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);