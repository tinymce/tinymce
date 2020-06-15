import { Keys, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import * as TableTestUtils from '../../module/test/TableTestUtils';

/* Note, this test needs a toolbar, but it 'passes', because it is checking that toolbar has
 * been turned off properly. So it fake passes if there is no toolbar support.
 */
UnitTest.asynctest('browser.tinymce.plugins.table.TableTablNavigationDisabledTest', (success, failure) => {
  TablePlugin();
  SilverTheme();

  const tableHtml = '<table><tbody><tr><td>a</td></tr><tr><td>a</td></tr></tbody></table>';

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Table: test table grid disabled', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(tableHtml),
        // NOTE: This isn't really testing anything because this does not exist yet.
        TableTestUtils.sOpenToolbarOn(editor, 'td', [ 0 ]),
        tinyActions.sContentKeystroke(Keys.tab(), {}),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1)
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'table',
    table_tab_navigation: false,
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
}
);
