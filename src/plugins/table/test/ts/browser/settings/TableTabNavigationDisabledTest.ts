import { GeneralSteps } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import TableTestUtils from '../../module/test/TableTestUtils';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest(
  'browser.tinymce.plugins.table.TableTablNavigationDisabledTest',
  function () {
    const success = arguments[arguments.length - 2];
    const failure = arguments[arguments.length - 1];

    ModernTheme();
    TablePlugin();

    const tableHtml = '<table><tbody><tr><td>a</td></tr><tr><td>a</td></tr></tbody></table>';

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        Logger.t('test table grid disabled', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent(tableHtml),
          TableTestUtils.sOpenToolbarOn(editor, 'td', [0]),
          tinyActions.sContentKeystroke(Keys.tab(), {}),
          tinyApis.sAssertSelection([0, 0, 0, 0], 0, [0, 0, 0, 0], 1)
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'table',
      table_tab_navigation: false,
      skin_url: '/project/js/tinymce/skins/lightgray'
    }, success, failure);
  }
);
