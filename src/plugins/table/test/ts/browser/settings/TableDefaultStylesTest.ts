import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.table.TableDefaultStylesTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TablePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('no styles without setting', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table")'),
        tinyUi.sClickOnUi('click table grid', 'td[role="gridcell"]:first a'),
        Step.sync(function () {
          const table = editor.getBody().querySelector('table');
          RawAssertions.assertEq('should be empty', '', table.style.border);
        }),
        tinyApis.sSetContent('')
      ])),

      Logger.t('test default style border attribute', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('table_default_styles', { border: '3px solid blue' }),
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table")'),
        tinyUi.sClickOnUi('click table grid', 'td[role="gridcell"]:first a'),
        Step.sync(function () {
          const table = editor.getBody().querySelector('table');
          RawAssertions.assertEq('should be undefined', '3px solid blue', table.style.border);
        }),
        tinyApis.sSetContent('')
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'table',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
