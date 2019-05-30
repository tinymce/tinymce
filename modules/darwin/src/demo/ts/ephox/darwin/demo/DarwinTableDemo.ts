import { document, window } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import {
  Attr,
  Body,
  Compare,
  Direction,
  DomEvent,
  Element,
  Insert,
  Node,
  Replication,
  Selection,
  SelectorFind,
  Traverse,
  WindowSelection,
} from '@ephox/sugar';
import Ephemera from 'ephox/darwin/api/Ephemera';
import InputHandlers from 'ephox/darwin/api/InputHandlers';
import SelectionAnnotation from 'ephox/darwin/api/SelectionAnnotation';
import SelectionKeys from 'ephox/darwin/api/SelectionKeys';
import Util from 'ephox/darwin/selection/Util';

var detection = PlatformDetection.detect();

var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
Attr.set(ephoxUi, 'contenteditable', 'true');

var style = Element.fromHtml(
  '<style>' +
    'table { border-collapse: separate; border-spacing: 30px; }\n' +
    'td { text-align: left; border: 1px solid #aaa; font-size: 20px; }\n' +
    'td.ephox-darwin-selected { background: #cadbee; }\n' +
    '#coords { position: fixed; right: 0px; bottom: 0px; background: #ddd }' +
  '</style>'
);

var table = Element.fromHtml(
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
// var table = Element.fromHtml(
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
Insert.append(Element.fromDom(document.head), style);

var rtlTable = Replication.deep(table);
Attr.set(rtlTable, 'dir', 'rtl');
Insert.append(ephoxUi, rtlTable);

var cloneDiv = Element.fromTag('div');
Attr.set(cloneDiv, 'contenteditable', 'true');
var clone = Replication.deep(table);
Insert.append(cloneDiv, clone);
Insert.append(Body.body(), cloneDiv);

Insert.append(Body.body(), Element.fromHtml('<span id="coords">(0, 0)</span>'));
DomEvent.bind(Body.body(), 'mousemove', function (event) {
  document.querySelector('#coords').innerHTML = '(' + event.raw().clientX + ', ' + event.raw().clientY + ')';
});

//Compare.eq(Body.body(), )

var annotations = SelectionAnnotation.byClass(Ephemera);
var mouseHandlers = InputHandlers.mouse(window, ephoxUi, Fun.curry(Compare.eq, table), annotations);
var keyHandlers = InputHandlers.keyboard(window, ephoxUi, Fun.curry(Compare.eq, table), annotations);

DomEvent.bind(ephoxUi, 'mousedown', mouseHandlers.mousedown);
DomEvent.bind(ephoxUi, 'mouseover', mouseHandlers.mouseover);
DomEvent.bind(ephoxUi, 'mouseup', mouseHandlers.mouseup);

var handleResponse = function (event, response) {
  if (response.kill()) event.kill();
  response.selection().each(function (ns) {
    // ns is {start(): Situ, finish(): Situ}
    var relative = Selection.relative(ns.start(), ns.finish());
    var range = Util.convertToRange(window, relative);
    WindowSelection.setExact(window, range.start(), range.soffset(), range.finish(), range.foffset());
    // WindowSelection.setExact(window, ns.start(), ns.soffset(), ns.finish(), ns.foffset());
  });
};

DomEvent.bind(ephoxUi, 'keyup', function (event) {
  // Note, this is an optimisation.
  if (event.raw().shiftKey && event.raw().which >= 37 && event.raw().which <= 40) {
    WindowSelection.getExact(window).each(function (sel) {
      keyHandlers.keyup(event, sel.start(), sel.soffset(), sel.finish(), sel.foffset()).each(function (response) {
        handleResponse(event, response);
      });
    });
  }
});

DomEvent.bind(ephoxUi, 'keydown', function (event) {
  // This might get expensive.
  WindowSelection.getExact(window).each(function (sel) {
    var target = Node.isText(sel.start()) ? Traverse.parent(sel.start()) : Option.some(sel.start());
    var direction = target.map(Direction.getDirection).getOr('ltr');
    keyHandlers.keydown(event, sel.start(), sel.soffset(), sel.finish(), sel.foffset(), direction === 'ltr' ? SelectionKeys.ltr : SelectionKeys.rtl).each(function (response) {
      handleResponse(event, response);
    });
  });
});
