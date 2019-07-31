import { Assertions, Chain, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import SilverTheme from 'tinymce/themes/silver/Theme';
import TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableAppearanceTest', (success, failure) => {
  TablePlugin();
  SilverTheme();

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Table: test that settings for appearance can be disabled', [
        tinyApis.sFocus,
        tinyApis.sSetContent(tableHtml),
        // This used to be opening the context toolbar.
        tinyApis.sSelect('table td', [0]),
        tinyApis.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          TableTestUtils.cWaitForDialog,
          Chain.op(function (dialog) {
            Assertions.assertPresence(
              'assert presence of spacing, padding, border and caption inputs',
              {
                // Remove the label:0 when it is working.
                'label:contains("Cell spacing")': 0,
                'label:contains("Cell padding")': 0,
                'label:contains("Border") + input': 0,
                'label:contains("Caption")': 0
              }, dialog);
          })
        ]),
        TableTestUtils.sClickDialogButton('close', false)
      ]),

      Log.stepsAsStep('TBA', 'Table: test that settings for appearance can be enabled', [
        tinyApis.sSetSetting('table_appearance_options', true),
        tinyApis.sFocus,
        tinyApis.sSetContent(tableHtml),
        // This used to be opening the context toolbar.
        tinyApis.sSelect('table td', [0]),
        tinyApis.sExecCommand('mceTableProps'),
        Chain.asStep({}, [
          TableTestUtils.cWaitForDialog,
          Chain.op(function (dialog) {
            Assertions.assertPresence(
              'assert presence of spacing, padding, border and caption inputs',
              {
                // Remove the label:0 when it is working.
                'label:contains("Cell spacing")': 1,
                'label:contains("Cell padding")': 1,
                'label:contains("Border") + input': 1,
                'label:contains("Caption")': 1
              }, dialog);
          })
        ]),
        TableTestUtils.sClickDialogButton('close', false)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    toolbar: 'table',
    table_appearance_options: false,
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
