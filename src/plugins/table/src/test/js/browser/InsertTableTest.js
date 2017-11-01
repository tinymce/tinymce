asynctest(
  'browser.tinymce.plugins.table.InsertTableTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.table.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, Plugin, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Plugin();
    Theme();

    var sInsertTable = function (editor, cols, rows) {
      return Step.sync(function () {
        editor.plugins.table.insertTable(cols, rows);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Insert table 2x2', GeneralSteps.sequence([
          tinyApis.sSetContent(''),
          sInsertTable(editor, 2, 2),
          tinyApis.sAssertContent('<table style="width: 100%; border-collapse: collapse;" border="1"><tbody><tr><td style="width: 50%;">&nbsp;</td><td style="width: 50%;">&nbsp;</td></tr><tr><td style="width: 50%;">&nbsp;</td><td style="width: 50%;">&nbsp;</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0)
        ])),
        Logger.t('Insert table 1x2', GeneralSteps.sequence([
          tinyApis.sSetContent(''),
          sInsertTable(editor, 1, 2),
          tinyApis.sAssertContent('<table style="width: 100%; border-collapse: collapse;" border="1"><tbody><tr><td style="width: 100%;">&nbsp;</td></tr><tr><td style="width: 100%;">&nbsp;</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0)
        ])),
        Logger.t('Insert table 2x1', GeneralSteps.sequence([
          tinyApis.sSetContent(''),
          sInsertTable(editor, 2, 1),
          tinyApis.sAssertContent('<table style="width: 100%; border-collapse: collapse;" border="1"><tbody><tr><td style="width: 50%;">&nbsp;</td><td style="width: 50%;">&nbsp;</td></tr></tbody></table>'),
          tinyApis.sAssertSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0)
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'table',
      indent: false,
      valid_styles: {
        '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
      },
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
