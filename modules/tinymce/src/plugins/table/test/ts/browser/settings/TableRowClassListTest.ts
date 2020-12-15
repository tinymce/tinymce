import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableRowClassListTest', (success, failure) => {
  TablePlugin();
  SilverTheme();

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Table: no class input without setting', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(tableHtml),
        tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1),
        tinyApis.sExecCommand('mceTableRowProps'),
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
        tinyApis.sSetSetting('table_row_class_list', [{ title: 'test', value: 'test' }]),
        tinyApis.sSetContent(tableHtml),
        tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1),
        tinyApis.sExecCommand('mceTableRowProps'),
        TableTestUtils.sAssertListBoxValue('Select class', 'Class', 'test'),
        TableTestUtils.sClickDialogButton('Trigger test class', true),
        tinyApis.sAssertContentPresence({ 'tr.test': 1 })
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
