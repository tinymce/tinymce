import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.TableGridFalse', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TablePlugin();

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
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
