import { Keys, Log, Pipeline, Step, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import Env from 'tinymce/core/api/Env';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.quirks.KeyboardCellNavigationTest', (success, failure) => {
  TablePlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const selectionChangeState = Cell(false);

    Pipeline.async({}, Env.webkit ?
      Log.steps('TBA', 'TestCase-Table-TBA-Create lists within table cells and verify keyboard navigation for the cells', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(
          '<table><tbody><tr><td><ul><li>a</li><li>b</li></ul></td></tr><tr><td><ul><li>c</li><li>d</li></ul></td></tr></tbody></table>'
        ),
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0, 1, 0 ], 0),
        tinyActions.sContentKeydown(Keys.down(), {}),
        tinyApis.sSetCursor([ 0, 0, 1, 0, 0, 0, 0 ], 0),
        Step.sync(function () {
          editor.on('SelectionChange', function () {
            selectionChangeState.set(true);
          });
        }),
        Waiter.sTryUntil(
          'editor did not have correct selection',
          Step.sync(function () {
            Assert.eq('state is true', true, selectionChangeState.get());
          })
        ),
        tinyApis.sAssertSelection([ 0, 0, 1, 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0, 0, 0, 0 ], 0)
      ])
      : [], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    height: 300
  }, success, failure);
}
);
