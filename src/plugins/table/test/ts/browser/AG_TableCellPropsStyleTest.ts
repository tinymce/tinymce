import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Editor } from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import SilverTheme from '../../../../../themes/silver/main/ts/Theme';
import TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableCellPropsStyleTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Table: change background color on selected table cells', [
        tinyApis.sSetContent(
          '<table style="border-collapse: collapse;" border="1"><tbody><tr><td style="background-color: blue;" data-mce-selected="1">a</td><td style="background-color: blue;" data-mce-selected="1">b</td></tr></tbody></table>'
        ),
        tinyApis.sSetSelection([0, 0, 0, 1, 0], 1, [0, 0, 0, 1, 0], 1),
        tinyApis.sExecCommand('mceTableCellProps'),
        TableTestUtils.sSetPartialDialogContents(editor, {
          // This is now case sensitive
          backgroundcolor: 'red'
        }),
        TableTestUtils.sClickDialogButton('Clicking OK', true),
        tinyApis.sAssertContent(
          '<table style="border-collapse: collapse;" border="1"><tbody><tr><td style="background-color: red;">a</td><td style="background-color: red;">b</td></tr></tbody></table>'
        )
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent : false,
    theme : 'silver',
    skin_url : '/project/js/tinymce/skins/oxide'
  }, success, failure );
});
