import { Logger, Pipeline, Step, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.InsertTableTest', (success, failure) => {
  Plugin();
  SilverTheme();

  const sInsertTable = function (editor, cols, rows) {
    return Logger.t('Insert table ' + cols + 'x' + rows, Step.sync(function () {
      editor.plugins.table.insertTable(cols, rows);
    }));
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, 2, 2),
        tinyApis.sAssertContent('<table style="width: 100%; border-collapse: collapse;" border="1"><tbody><tr><td style="width: 50%;">&nbsp;</td><td style="width: 50%;">&nbsp;</td></tr><tr><td style="width: 50%;">&nbsp;</td><td style="width: 50%;">&nbsp;</td></tr></tbody></table>'),
        tinyApis.sAssertSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 1x2', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, 1, 2),
        tinyApis.sAssertContent('<table style="width: 100%; border-collapse: collapse;" border="1"><tbody><tr><td style="width: 100%;">&nbsp;</td></tr><tr><td style="width: 100%;">&nbsp;</td></tr></tbody></table>'),
        tinyApis.sAssertSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x1', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, 2, 1),
        tinyApis.sAssertContent('<table style="width: 100%; border-collapse: collapse;" border="1"><tbody><tr><td style="width: 50%;">&nbsp;</td><td style="width: 50%;">&nbsp;</td></tr></tbody></table>'),
        tinyApis.sAssertSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 0)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false
  }, success, failure);
});
