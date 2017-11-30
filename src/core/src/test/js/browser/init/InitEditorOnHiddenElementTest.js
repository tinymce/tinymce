asynctest(
  'browser.tinymce.core.init.InitEditorOnHiddenElementTest',
  [
    'ephox.agar.api.Chain',
    'ephox.mcagar.api.ApiChains',
    'ephox.mcagar.api.Editor',
    'global!document',
    'tinymce.themes.modern.Theme'
  ],
  function (Chain, ApiChains, Editor, document, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    // Firefox specific test, errors were thrown when the editor was initialised on hidden element.
    Chain.pipeline([
      Editor.cFromHtml('<textarea style="display:none;"></textarea>', {
        skin_url: '/project/src/skins/lightgray/dist/lightgray'
      }),
      ApiChains.cFocus
    ],
    function () {
      success();
    }, failure);
  }
);