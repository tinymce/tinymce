import { GeneralSteps, Logger, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.DisableTableToolbarTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TablePlugin();

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('test that table toolbar can be disabled', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('table_toolbar', 'tableprops tabledelete'),
        tinyApis.sSetContent(tableHtml),
        tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1),
        Step.wait(100), // How should I do this better?
                        // I want to check that the inline toolbar does not appear,
                        // but I have to wait unless it won't exist any way because it's too fast
        UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[aria-label="Inline toolbar"]')
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    table_toolbar: '',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
