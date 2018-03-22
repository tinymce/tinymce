import { GeneralSteps, Logger, Pipeline, Chain, UiFinder, Mouse } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import { Editor } from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.plugins.table.TableCellPropsStyleTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('change background color on selected table cells', GeneralSteps.sequence([
        tinyApis.sSetContent(
          '<table style="border-collapse: collapse;" border="1"><tbody><tr><td style="background-color: blue;" data-mce-selected="1">a</td><td style="background-color: blue;" data-mce-selected="1">b</td></tr></tbody></table>'
        ),
        tinyApis.sSetSelection([0, 0, 0, 1, 0], 1, [0, 0, 0, 1, 0], 1),
        tinyApis.sExecCommand('mceTableCellProps'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('cell prop popup', 'div[aria-label="Cell properties"]'),
          tinyUi.cFillDialogWith({ backgroundColor: 'red'}),
          UiFinder.cFindIn('button:contains("Ok")'),
          Mouse.cClick
        ]),
        tinyApis.sAssertContent(
          '<table style="border-collapse: collapse;" border="1"><tbody><tr><td style="background-color: red;">a</td><td style="background-color: red;">b</td></tr></tbody></table>'
        ),
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
