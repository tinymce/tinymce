import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.TableClassListTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TablePlugin();

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('no class input without setting', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent(tableHtml),
        tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1),
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table properties")'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[aria-label="Table properties"][role="dialog"]'),
          Chain.op(function (x) {
            Assertions.assertPresence(
              'assert presence of col and row input',
              {
                'label:contains("Class")': 0
              }, x);
          })
        ]),
        tinyUi.sClickOnUi('close popup', 'button > span:contains("Cancel")'),
        tinyApis.sSetContent('')
      ])),

      Logger.t('class input with setting', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('table_class_list', [{ title: 'test', value: 'test' }]),
        tinyApis.sSetContent(tableHtml),
        tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 1),
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table properties")'),
        tinyUi.sWaitForPopup('wait for popup', 'div[aria-label="Table properties"][role="dialog"]'),
        tinyUi.sClickOnUi('click class input', 'button > span:contains("test")'),
        tinyUi.sClickOnUi('click class input', 'div[role="menuitem"] > span:contains("test")'),
        tinyUi.sClickOnUi('close popup', 'button > span:contains("Ok")'),
        tinyApis.sAssertContentPresence({ 'table.test': 1 })
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
