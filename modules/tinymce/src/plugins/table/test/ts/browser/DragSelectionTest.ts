import { Chain, Log, Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/table/Plugin';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.DragSelectionTest', (success, failure) => {
  Theme();
  Plugin();

  TinyLoader.setupLight((editor, success, failure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent(`<div>
        <table style="border-collapse: collapse; width: 100%;" border="1">
          <tbody>
            <tr>
              <td style="width: 33.333%;">1</td>
              <td style="width: 33.334%;">2</td>
              <td id="dragto" style="width: 33.333%;">3</td>
            </tr>
            <tr>
              <td style="width: 66.667%;" colspan="2" rowspan="2">4</td>
              <td style="width: 33.333%;"><span id="dragfrom" contenteditable="false">55</span></td>
            </tr>
            <tr>
              <td style="width: 33.333%;">6</td>
            </tr>
          </tbody>
        </table>
      </div>`),

      Log.chainsAsStep('TINY-5950', 'Drag and drop should not select', [
        Chain.mapper(() => SugarElement.fromDom(editor.getBody())),
        Chain.fromIsolatedChains([
          UiFinder.cFindIn('#dragfrom'),
          Mouse.cMouseDownWith({ }),
          // realistically the browser would probably put more than 2 mousemove events in here
          // but as long as there aren't zero mouse move events along the way to the mouse over
          // event then it's okay
          Mouse.cMouseMoveWith({ dx: 0, dy: -10, buttons: Mouse.leftClickButtons }),
          Mouse.cMouseMoveWith({ dx: 0, dy: -20, buttons: Mouse.leftClickButtons })
        ]),
        Chain.fromIsolatedChains([
          UiFinder.cFindIn('#dragto'),
          Mouse.cMouseOverWith({ buttons: Mouse.leftClickButtons })
        ]),
        UiFinder.cNotExists('td[data-mce-selected]')
      ])
    ], success, failure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'table',
    height: 300
  }, success, failure);
});
