asynctest(
  'browser.tinymce.plugins.table.DefaultTableToolbarTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.table.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, Step, UiFinder, TinyApis, TinyDom, TinyLoader, TinyUi, TablePlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    TablePlugin();

    var tableHtml = '<table><tbody><tr><td><span id="aim">x</span></td></tr></tbody></table>';

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('check that table toolbar is disabled', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetSetting('table_toolbar', 'tableprops tabledelete'),
          tinyApis.sSetContent(tableHtml),
          Mouse.sTrueClickOn(TinyDom.fromDom(editor.getBody()), 'table'),
          Step.wait(100), // How should I do this better?
                          // I want to check that the inline toolbar does not appear,
                          // but I have to wait unless it won't exist any way because it's too fast
          UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[aria-label="Inline toolbar"]')
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'table',
      table_toolbar: '',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);