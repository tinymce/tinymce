asynctest(
  'browser.tinymce.plugins.table.TableDefaultStylesTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.core.Env',
    'tinymce.plugins.table.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, RawAssertions, Step, TinyApis, TinyLoader, TinyUi, Env, TablePlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    TablePlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('no styles without setting', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
          tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table")'),
          tinyUi.sClickOnUi('click table grid', 'td[role="gridcell"]:first a'),
          Step.sync(function () {
            var table = editor.getBody().querySelector('table');
            RawAssertions.assertEq('should be empty', '', table.style.border);
          }),
          tinyApis.sSetContent('')
        ])),

        Logger.t('test default style border attribute', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetSetting('table_default_styles', { border: '3px solid blue' }),
          tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
          tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table")'),
          tinyUi.sClickOnUi('click table grid', 'td[role="gridcell"]:first a'),
          Step.sync(function () {
            var table = editor.getBody().querySelector('table');
            RawAssertions.assertEq('should be undefined', '3px solid blue', table.style.border);
          }),
          tinyApis.sSetContent('')
        ]))
      ], onSuccess, onFailure);
    }, {
      indent: false,
      plugins: 'table',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);