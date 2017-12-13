import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.plugins.table.TableDefaultAttributesTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  TablePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);
    var tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('no attributes without setting', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table")'),
        tinyUi.sClickOnUi('click table grid', 'a#mcegrid11'),
        tinyApis.sAssertContentPresence({ 'table': 1, 'table[title="x"]': 0 }),
        tinyApis.sSetContent('')
      ])),

      Logger.t('test default title attribute', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('table_default_attributes', { title: 'x' }),
        tinyUi.sClickOnMenu('click table menu', 'span:contains("Table")'),
        tinyUi.sClickOnUi('click table menu', 'div[role="menu"] span:contains("Table")'),
        tinyUi.sClickOnUi('click table grid', 'a#mcegrid11'),
        tinyApis.sAssertContentPresence({ 'table': 1, 'table[title="x"]': 1 }),
        tinyApis.sSetContent('')
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'table',
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

