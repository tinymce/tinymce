import { Fun, Optional } from '@ephox/katamari';
import {
  Attribute, Compare, Direction, DomEvent, EventArgs, Insert, Replication, SelectorFind, SimSelection, SugarBody, SugarElement, SugarNode, Traverse,
  WindowSelection
} from '@ephox/sugar';

import { Ephemera } from 'ephox/darwin/api/Ephemera';
import * as InputHandlers from 'ephox/darwin/api/InputHandlers';
import { SelectionAnnotation } from 'ephox/darwin/api/SelectionAnnotation';
import * as SelectionKeys from 'ephox/darwin/api/SelectionKeys';
import { Response } from 'ephox/darwin/selection/Response';
import * as Util from 'ephox/darwin/selection/Util';

const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
Attribute.set(ephoxUi, 'contenteditable', 'true');

const style = SugarElement.fromHtml<HTMLStyleElement>(
  '<style>' +
  'table { border-collapse: separate; border-spacing: 30px; }\n' +
  'td { text-align: left; border: 1px solid #aaa; font-size: 20px; }\n' +
  'td.ephox-darwin-selected { background: #cadbee; }\n' +
  '#coords { position: fixed; right: 0px; bottom: 0px; background: #ddd }' +
  '</style>'
);

const table = SugarElement.fromHtml<HTMLTableElement>(
  '<table style="width: 400px;">' +
  '<tbody>' +
  '<tr style="height: 20px;"><td>A</td><td rowspan="2" colspan="2">B</td><td>C</td></tr>' +
  '<tr style="height: 20px;"><td>D</td><td colspan="1" rowspan="2">E</td>' +
  '<tr style="height: 20px;"><td colspan="3" rowspan="3">F</td></tr>' +
  '<tr style="height: 20px;"><td>G</td></tr>' +
  '<tr style="height: 20px;"><td>H</td></tr>' +
  '<tr style="height: 20px;"><td rowspan="2" colspan="1">I</td><td>J</td><td colspan="2">K</td></tr>' +
  '<tr style="height: 20px;"><td colspan="2">L</td><td>M</td></tr>' +
  '</tbody>' +
  '</table>'
);

/* Uncomment for normal table with no colspans.
// const table = SugarElement.fromHtml(
//   '<table>' +
//     '<tbody>' +
//       '<tr>' +
//         '<td style="min-width: 100px;">A1</td>' +
//         '<td style="min-width: 100px;">B1<br /></td>' +
//         '<td style="min-width: 100px;" colspan=2>C1<br /><br /><br /></td>' +
//         // '<td style="min-width: 100px;">D1</td>' +
//       '</tr>' +
//       '<tr>' +
//         '<td style="min-width: 100px;">A2</td>' +
//         '<td style="min-width: 100px;">B2<br /><br /></td>' +
//         '<td style="min-width: 100px;"><p>C2</p><p>More</p></td>' +
//         '<td style="min-width: 100px;"><br />D2</td>' +
//       '</tr>' +
//       '<tr>' +
//         '<td style="min-width: 100px;">A3</td>' +
//         '<td style="min-width: 100px;"><br /></td>' +
//         '<td style="min-width: 100px;"><br /></td>' +
//         '<td style="min-width: 100px;">D3</td>' +
//       '</tr>' +
//       '<tr>' +
//         '<td style="padding-top: 100px;" style="min-width: 100px;">A4</td>' +
//         '<td style="padding-top: 100px;" style="min-width: 100px;"><br /></td>' +
//         '<td style="padding-top: 100px;" style="min-width: 100px;"><br /></td>' +
//         '<td style="padding-top: 100px;" style="min-width: 100px;">D4</td>' +
//       '</tr>' +
//     '</tbody>' +
//   '</table>'
// );
*/

Insert.append(ephoxUi, table);
Insert.append(SugarElement.fromDom(document.head), style);

const rtlTable = Replication.deep(table);
Attribute.set(rtlTable, 'dir', 'rtl');
Insert.append(ephoxUi, rtlTable);

const cloneDiv = SugarElement.fromTag('div');
Attribute.set(cloneDiv, 'contenteditable', 'true');
const clone = Replication.deep(table);
Insert.append(cloneDiv, clone);
Insert.append(SugarBody.body(), cloneDiv);

Insert.append(SugarBody.body(), SugarElement.fromHtml('<span id="coords">(0, 0)</span>'));
DomEvent.bind(SugarBody.body(), 'mousemove', (event) => {
  Optional.from(document.querySelector('#coords')).getOrDie('Could not find ID "coords"').innerHTML = '(' + event.raw.clientX + ', ' + event.raw.clientY + ')';
});

const annotations = SelectionAnnotation.byClass(Ephemera);
const mouseHandlers = InputHandlers.mouse(window, ephoxUi, Fun.curry(Compare.eq, table), annotations);
const keyHandlers = InputHandlers.keyboard(window, ephoxUi, Fun.curry(Compare.eq, table), annotations);

DomEvent.bind(ephoxUi, 'mousedown', mouseHandlers.mousedown);
DomEvent.bind(ephoxUi, 'mouseover', mouseHandlers.mouseover);
DomEvent.bind(ephoxUi, 'mouseup', mouseHandlers.mouseup);

const handleResponse = (event: EventArgs, response: Response) => {
  if (response.kill) {
    event.kill();
  }
  response.selection.each((ns) => {
    const relative = SimSelection.relative(ns.start, ns.finish);
    const range = Util.convertToRange(window, relative);
    WindowSelection.setExact(window, range.start, range.soffset, range.finish, range.foffset);
    // WindowSelection.setExact(window, ns.start, ns.soffset, ns.finish, ns.foffset);
  });
};

DomEvent.bind(ephoxUi, 'keyup', (event) => {
  // Note, this is an optimisation.
  if (event.raw.shiftKey && event.raw.which >= 37 && event.raw.which <= 40) {
    WindowSelection.getExact(window).each((sel) => {
      keyHandlers.keyup(event, sel.start, sel.soffset, sel.finish, sel.foffset).each((response) => {
        handleResponse(event, response);
      });
    });
  }
});

DomEvent.bind(ephoxUi, 'keydown', (event) => {
  // This might get expensive.
  WindowSelection.getExact(window).each((sel) => {
    const target = (SugarNode.isText(sel.start) ? Traverse.parentNode(sel.start) : Optional.some(sel.start)).filter(SugarNode.isElement);
    const direction = target.map(Direction.getDirection).getOr('ltr');
    keyHandlers.keydown(event, sel.start, sel.soffset, sel.finish, sel.foffset, direction === 'ltr' ? SelectionKeys.ltr : SelectionKeys.rtl).each((response) => {
      handleResponse(event, response);
    });
  });
});
