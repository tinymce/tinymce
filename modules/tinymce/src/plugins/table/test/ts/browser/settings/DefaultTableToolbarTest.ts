import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { SelectorFilter } from '@ephox/sugar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as TableTestUtils from '../../module/test/TableTestUtils';

/*
 *
 * NOTE: This is a context toolbar test. Can't migrate yet.
 *
 */
UnitTest.asynctest('browser.tinymce.plugins.table.DefaultTableToolbarTest', (success, failure) => {
  TablePlugin();
  Theme();

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('test default count of toolbar buttons', GeneralSteps.sequence([
        tinyApis.sFocus(),
        tinyApis.sSetContent(tableHtml),
        TableTestUtils.sOpenToolbarOn(editor, 'table td', [ 0 ]),
        Chain.asStep({}, [
          tinyUi.cWaitForUi('no context found', 'div.tox-pop div.tox-toolbar'),
          Chain.mapper((x) => {
            return SelectorFilter.descendants(x, 'button').length;
          }),
          Assertions.cAssertEq('has correct count', 8)
        ])
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
