asynctest(
  'browser.tinymce.plugins.table.TableToolbarTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.table.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Mouse, Pipeline, Step, TinyApis, TinyDom, TinyLoader, TablePlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    TablePlugin();

    var tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('check default count of toolbar buttons', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent(tableHtml),
          Mouse.sTrueClickOn(TinyDom.fromDom(editor.getBody()), 'table'),
        // tinyApis.sAssertContent('dfd'),
          Step.wait(90000000)
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'table',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);