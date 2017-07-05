asynctest(
  'browser.tinymce.plugins.table.CustomTableToolbarTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.table.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, Step, TinyApis, TinyDom, TinyLoader, TinyUi, TablePlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    TablePlugin();

    var tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('check default count of toolbar buttons', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent(tableHtml),
          Mouse.sTrueClickOn(TinyDom.fromDom(editor.getBody()), 'table'),
          Chain.asStep({}, [
            tinyUi.cWaitForUi('no context found', 'div[aria-label="Inline toolbar"]'),
            Chain.mapper(function (x) {
              return x.dom().querySelectorAll('button').length;
            }),
            Assertions.cAssertEq('has correct count', 2)
          ])
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'table',
      table_toolbar: 'tableprops tabledelete',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);