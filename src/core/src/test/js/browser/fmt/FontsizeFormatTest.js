asynctest(
  'browser.tinymce.core.fmt.FontsizeFormatTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'global!document',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, RawAssertions, Step, TinyLoader, TinyUi, document, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    var sAssertMenuItemCount = function (expected, editor) {
      return Step.sync(function () {
        var actual = document.querySelectorAll('.mce-menu-item').length;
        RawAssertions.assertEq('Should be correct count', expected, actual);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        tinyUi.sClickOnToolbar('Could not find fontsize select', 'div[aria-label="Font Sizes"] button'),
        tinyUi.sWaitForUi('Menu did not appear', 'div.mce-floatpanel'),
        sAssertMenuItemCount(1, editor)
      ], onSuccess, onFailure);
    }, {
      toolbar: 'fontsizeselect',
      fontsize_formats: '1em',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);