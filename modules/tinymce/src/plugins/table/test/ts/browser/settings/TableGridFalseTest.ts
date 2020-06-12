import { Assertions, Chain, GeneralSteps, Logger, Pipeline, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

/* This test requires a menubar. It is testing a setting which means that the table picker is replaced by just a dialog. */
UnitTest.asynctest('browser.tinymce.plugins.table.TableGridFalse', (success, failure) => {
  TablePlugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('test table grid disabled', GeneralSteps.sequence([
        tinyApis.sFocus(),
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        Waiter.sTryUntil('click table menu', tinyUi.sClickOnUi('click table menu', 'div.tox-menu div.tox-collection__item .tox-collection__item-label:contains("Table")')),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div.tox-dialog:has(div.tox-dialog__title:contains("Table Properties"))'),
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
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
