import { Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.models.dom.table.DragSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    height: 300
  }, []);

  it('TINY-5950: Drag and drop should not select', () => {
    const editor = hook.editor();
    editor.setContent(`<div>
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
      </div>`);
    const body = TinyDom.body(editor);
    const dragStart = UiFinder.findIn(body, '#dragfrom').getOrDie();
    Mouse.mouseDown(dragStart);
    // realistically the browser would probably put more than 2 mousemove events in here
    // but as long as there aren't zero mouse move events along the way to the mouse over
    // event then it's okay
    Mouse.mouseMove(dragStart, { dx: 0, dy: -10, buttons: Mouse.leftClickButtons });
    Mouse.mouseMove(dragStart, { dx: 0, dy: -20, buttons: Mouse.leftClickButtons });

    const dragEnd = UiFinder.findIn(body, '#dragto').getOrDie();
    Mouse.mouseOver(dragEnd, { buttons: Mouse.leftClickButtons });
    UiFinder.notExists(body, 'td[data-mce-selected]');
  });
});
