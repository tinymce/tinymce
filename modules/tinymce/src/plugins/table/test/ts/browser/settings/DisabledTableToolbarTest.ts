import { Pipeline, Step, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { document } from '@ephox/dom-globals';

/*
 *
 * NOTE: This is a context toolbar test. Can't migrate yet.
 *
 */
UnitTest.asynctest('browser.tinymce.plugins.table.DisableTableToolbarTest', (success, failure) => {
  TablePlugin();
  Theme();

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
     Log.steps('TBA', 'Table: test that table toolbar can be disabled', [
        tinyApis.sFocus,
        tinyApis.sSetSetting('table_toolbar', 'tableprops tabledelete'),
        tinyApis.sSetContent(tableHtml),
        tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1),
        Step.wait(100), // How should I do this better?
                        // I want to check that the inline toolbar does not appear,
                        // but I have to wait unless it won't exist any way because it's too fast
        UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div.tox-pop div.tox-toolbar')
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'table',
    table_toolbar: '',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
