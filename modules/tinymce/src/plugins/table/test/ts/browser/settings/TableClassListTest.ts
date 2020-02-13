import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import SilverTheme from 'tinymce/themes/silver/Theme';
import TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableClassListTest', (success, failure) => {
  TablePlugin();
  SilverTheme();

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Table: no class input without setting', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(tableHtml),
        tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1),
        tinyApis.sExecCommand('mceTableProps'),
        TableTestUtils.sAssertDialogPresence(
          'Checking that class label is not present',
          {
            'label:contains("Class")': 0
          }
        ),
        TableTestUtils.sClickDialogButton('close', false),
        tinyApis.sSetContent('')
      ]),

      Log.stepsAsStep('TBA', 'Table: class input with setting', [
        tinyApis.sFocus(),
        tinyApis.sSetSetting('table_class_list', [{ title: 'test', value: 'test' }]),
        tinyApis.sSetContent(tableHtml),
        tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1),
        // FIX: Dupe with TableCellClassListTest.
        tinyApis.sExecCommand('mceTableProps'),
        TableTestUtils.sAssertSelectValue('Select class', 'Class', 'test'),
        TableTestUtils.sClickDialogButton('Trigger test class', true),
        tinyApis.sAssertContentPresence({ 'table.test': 1 })
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
