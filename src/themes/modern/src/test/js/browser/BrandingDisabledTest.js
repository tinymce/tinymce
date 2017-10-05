asynctest(
  'browser.tinymce.themes.modern.test.BradingDisabledTest',
  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'tinymce.themes.modern.Theme'
  ],
  function (Logger, Pipeline, UiFinder, TinyLoader, Element, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, [
        Logger.t('Branding element should not exist', UiFinder.sNotExists(Element.fromDom(editor.getContainer()), '.mce-branding'))
      ], onSuccess, onFailure);
    }, {
      theme: 'modern',
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      branding: false
    }, success, failure);
  }
);
