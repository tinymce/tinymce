import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

import TableTestUtils from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.TableAppearanceTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TablePlugin();

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('text that settings for appearance can be disabled', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent(tableHtml),
        TableTestUtils.sOpenToolbarOn(editor, 'table td', [0]),
        tinyUi.sWaitForUi('no context found', 'div[aria-label="Inline toolbar"]'),
        tinyUi.sClickOnToolbar('click table button', 'div[aria-label="Table"] > button'),
        tinyUi.sClickOnUi('click properties menu item', 'span:contains("Table properties")'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[aria-label="Table properties"][role="dialog"]'),
          Chain.op(function (x) {
            Assertions.assertPresence(
              'assert presence of spacing, padding, border and caption inputs',
              {
                'label:contains("Cell spacing")': 0,
                'label:contains("Cell padding")': 0,
                'label:contains("Border") + input': 0,
                'label:contains("Caption")': 0
              }, x);
          })
        ])
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    toolbar: 'table',
    table_appearance_options: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
