import { Assert, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Insert, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

import { ResizeWire } from 'ephox/snooker/api/ResizeWire';
import { BarManager } from 'ephox/snooker/resize/BarManager';

const rowHtml = '<tr><td style="width: 200px"></td><td style="width: 200px"></td></tr>';
const tableHtml = `<table style="width: 400px"><tbody>${rowHtml.repeat(2)}</tbody></table>`;

const assertMouseDownPrevented = (editable: SugarElement, barType: 'column' | 'row') => {
  const barSelector = `div[data-${barType}="0"]`;
  const bar = SelectorFind.descendant(editable, barSelector).getOrDie(`No ${barType} resize bar in the editable`);
  // NOTE: There is no sensible way to emulate moving selection
  // on a mousedown event so the next best thing is to check
  // if the event's default behavior is prevented.
  const mouseDownEvent = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true
  });
  const isPrevented = !bar.dom.dispatchEvent(mouseDownEvent);

  Assert.eq(`Default mousedown behavior should be prevented on ${barType} resize bar`, true, isPrevented);
};

describe('BarManagerTest', () => {
  it('TINYMCE-14594: interacting with resizing bars should not move the selection', () => {
    const editable = SugarElement.fromHtml<HTMLDivElement>('<div contenteditable="true" style="width: 800px;"></div>');
    const table = SugarElement.fromHtml<HTMLTableElement>(tableHtml);

    Insert.append(editable, table);
    Insert.append(SugarBody.body(), editable);

    const resizeWire = ResizeWire.body(editable, Fun.always);
    const barManager = BarManager(resizeWire);

    barManager.refresh(table);

    assertMouseDownPrevented(editable, 'column');
    assertMouseDownPrevented(editable, 'row');

    barManager.destroy();
    Remove.remove(editable);
  });
});
