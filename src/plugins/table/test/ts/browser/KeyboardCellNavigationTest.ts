import { Keys, Pipeline, RawAssertions, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Cell } from '@ephox/katamari';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import Env from 'tinymce/core/api/Env';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest(
  'browser.tinymce.plugins.table.quirks.KeyboardCellNavigationTest',
  function () {
    const success = arguments[arguments.length - 2];
    const failure = arguments[arguments.length - 1];

    ModernTheme();
    TablePlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const tinyActions = TinyActions(editor);

      const selectionChangeState = Cell(false);

      Pipeline.async({}, Env.webkit ? [
        tinyApis.sFocus,
        tinyApis.sSetContent(
          '<table><tbody><tr><td><ul><li>a</li><li>b</li></ul></td></tr><tr><td><ul><li>c</li><li>d</li></ul></td></tr></tbody></table>'
        ),
        tinyApis.sSetCursor([0, 0, 0, 0, 0, 1, 0], 0),
        tinyActions.sContentKeydown(Keys.down(), {}),
        tinyApis.sSetCursor([0, 0, 1, 0, 0, 0, 0], 0),
        Step.sync(function () {
          editor.on('selectionchange', function () {
            selectionChangeState.set(true);
          });
        }),
        Waiter.sTryUntil(
          'editor did not have correct selection',
          Step.sync(function () {
            RawAssertions.assertEq('state is true', true, selectionChangeState.get());
          }),
          100, 3000
        ),
        tinyApis.sAssertSelection([0, 0, 1, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0, 0, 0], 0)
      ] : [], onSuccess, onFailure);
    }, {
      plugins: 'table',
      skin_url: '/project/js/tinymce/skins/lightgray',
      height: 300
    }, success, failure);
  }
);
