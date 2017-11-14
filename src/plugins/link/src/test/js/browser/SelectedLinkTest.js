asynctest(
  'browser.tinymce.plugins.link.SelectedLinkTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.link.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, UiControls, UiFinder, TinyApis, TinyLoader, TinyUi, LinkPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    LinkPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('should not get anchor info if not selected node', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><a href="http://tinymce.com">tiny</a></p>'),
          tinyApis.sSetSelection([0], 1, [0], 1),
          tinyApis.sExecCommand('mcelink'),
          Chain.asStep({}, [
            tinyUi.cWaitForPopup('wait for link popup', 'div[role="dialog"][aria-label="Insert link"]'),
            UiFinder.cFindIn('label:contains("Url") + div > input'),
            UiControls.cGetValue,
            Assertions.cAssertEq('assert value is nothing', '')
          ])
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'link',
      toolbar: '',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);