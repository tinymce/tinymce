import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from '../../../../../../themes/silver/main/ts/Theme';

/* This test requires a menubar. It is testing a setting which means that the table picker is replaced by just a dialog. */
UnitTest.asynctest('browser.tinymce.plugins.table.TableGridFalse', (success, failure) => {
  TablePlugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('test table grid disabled', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table")'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[aria-label="Table properties"][role="dialog"]'),
          Chain.op(function (x) {
            Assertions.assertPresence(
              'assert presence of col and row input',
              {
                'label:contains("Cols")': 1,
                'label:contains("Rows")': 1
              }, x);
          })
        ])
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    table_grid: false,
    theme: 'silver',
    skin_url: '/project/js/tinymce/skins/oxide',
  }, success, failure);
});
