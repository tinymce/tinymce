import { Obj } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import ResizeDirection from 'ephox/snooker/api/ResizeDirection';
import ResizeWire from 'ephox/snooker/api/ResizeWire';
import TableOperations from 'ephox/snooker/api/TableOperations';
import TableResize from 'ephox/snooker/api/TableResize';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Direction } from '@ephox/sugar';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';
import { Ready } from '@ephox/sugar';
import { Replication } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';



export default <any> function () {

  var tester = Element.fromHtml(
    '<table border=1>'+
      '<tr>'+
        '<th>A0</th>'+
        '<th>A1</th>'+
        '<th>A2</th>'+
        '<th>A3</th>'+
        '<th>A4</th>'+
      '</tr>'+
      '<tr>'+
        '<td>B0</td>'+
        '<td>B1</td>'+
        '<td>B2</td>'+
        '<td>B3</td>'+
        '<td rowspan="2">B3</td>'+
      '</tr>'+
      '<tr>'+
        '<td>C0</td>'+
        '<td>C1</td>'+
        '<td>C2</td>'+
        '<td>C3</td>'+
      '</tr>'+
    '</table>'
  );

  var subject = Element.fromHtml(
    '<table contenteditable="true" style="border-collapse: collapse;" border="1"><tbody>' +
      '<tr>' +
        '<td style="width: 110px;">1</td>' +
        '<td colspan="5">.</td>' +
      '</tr>' +
      '<tr>' +
        '<td colspan=2>.</td>' +
        '<td style="width: 130px;">3</td>' +
        '<td colspan=2>.</td>' +
        '<td style="width: 160px;">6</td>' +
      '</tr>' +
      '<tr>' +
        '<td colspan=3>.</td>' +
        '<td style="width: 140px;">4</td>' +
        '<td colspan=2>.</td>' +
      '</tr>' +
      '<tr>' +
        '<td colspan=4>.</td>' +
        '<td colspan=2>.</td>' +
      '</tr>' +
      '<tr>' +
        '<td rowspan=2>x</td>' +
        '<td style="width: 120px;">2</td>' +
        '<td colspan=2>.</td>' +
        '<td style="width: 150px;">5</td>' +
        '<td>x</td>' +
      '</tr>' +
      '<tr>' +
        '<td style="width: 120px;" rowspan=2>2</td>' +
        '<td colspan=2>.</td>' +
        '<td style="width: 150px;">5</td>' +
        '<td>x</td>' +
      '</tr>' +
      '<tr>' +
        '<td>1</td>' +
        '<td colspan=2>.</td>' +
        '<td style="width: 150px;">5</td>' +
        '<td>x</td>' +
      '</tr>' +
    '</tbody></table>'
  );

// subject = Element.fromHtml('<table contenteditable="true" style="border-collapse: collapse;"><tbody><tr><td>A</td><td>A2</td></tr><tr><td rowspan=2>B</td><td>C</td></tr><tr><td>d</td></tr></tbody></table>');
// subject = Element.fromHtml('<table contenteditable="true" style="border-collapse: collapse;"><tbody><tr><td>A</td></tr><tr><td rowspan=2>B</td></tr></tbody></table>');

  var subject2 = Element.fromHtml(
    '<table contenteditable="true" style="border-collapse: collapse;"><tbody>' +
      '<tr>' +
        '<td style="width: 110px;">1</td>' +
        // '<td colspan="1">.</td>' +
      '</tr>' +
      // '<tr>' +
      //   '<td>x</td>' +
      //   '<td style="width: 120px;">2</td>' +
      //   '<td>.</td>' +
      //   '<td style="width: 150px;">5</td>' +
      //   '<td>x</td>' +
      // '</tr>' +
    '</tbody></table>'
  );

  var subject3 = Element.fromHtml('<table contenteditable="true" width="100%" cellpadding="0" border="1" cellspacing="0"> <tbody><tr> <td rowspan="2" width="34%">&nbsp;a</td> <td width="33%">&nbsp;b</td> <td width="33%">&nbsp;c</td> </tr> <tr> <td width="33%">&nbsp;d</td> <td rowspan="2" width="33%">&nbsp;e</td> </tr> <tr> <td width="34%">&nbsp;f</td> <td width="33%">&nbsp;g</td> </tr> <tr> <td width="34%">&nbsp;h</td> <td width="33%">&nbsp;i</td> <td width="33%">j&nbsp;</td> </tr> </tbody></table>');

  var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
  var ltrs = Element.fromHtml('<div class="ltrs"></div>');
  InsertAll.append(ltrs, [ Element.fromHtml('<p>Left to Right tables</p>'), tester, Element.fromTag('p'), subject2 ]);
  var rtls = Element.fromHtml('<div dir="rtl"></div>');
   InsertAll.append(rtls, [ Element.fromHtml('<p>Right to Left table</p>'), subject3 ]);
  InsertAll.append(ephoxUi, [ ltrs, rtls ]);

  var ltrManager = TableResize(ResizeWire.only(ltrs), ResizeDirection.ltr);
  ltrManager.on();
  var rtlManager = TableResize(ResizeWire.only(rtls), ResizeDirection.rtl);
  rtlManager.on();

  // For firefox.
  Ready.execute(function () {
    // document.execCommand("enableInlineTableEditing", null, false);
    // document.execCommand("enableObjectResizing", false, "false");
  });


  var afterRow = Element.fromTag('button');
  Insert.append(afterRow, Element.fromText('Row After'));
  Insert.append(ephoxUi, afterRow);

  var beforeRow = Element.fromTag('button');
  Insert.append(beforeRow, Element.fromText('Row Before'));
  Insert.append(ephoxUi, beforeRow);

  var afterColumn = Element.fromTag('button');
  Insert.append(afterColumn, Element.fromText('Column After'));
  Insert.append(ephoxUi, afterColumn);

  var beforeColumn = Element.fromTag('button');
  Insert.append(beforeColumn, Element.fromText('Column Before'));
  Insert.append(ephoxUi, beforeColumn);

  var splitCellIntoColumns = Element.fromTag('button');
  Insert.append(splitCellIntoColumns, Element.fromText('Split Cell Into Columns'));
  Insert.append(ephoxUi, splitCellIntoColumns);

  var splitCellIntoRows = Element.fromTag('button');
  Insert.append(splitCellIntoRows, Element.fromText('Split Cell Into Rows'));
  Insert.append(ephoxUi, splitCellIntoRows);

  var eraseRow = Element.fromTag('button');
  Insert.append(eraseRow, Element.fromText('Erase row'));
  Insert.append(ephoxUi, eraseRow);

  var eraseColumn = Element.fromTag('button');
  Insert.append(eraseColumn, Element.fromText('Erase column'));
  Insert.append(ephoxUi, eraseColumn);

  var makeButton = function (desc) {
    var button = Element.fromTag('button');
    Insert.append(button, Element.fromText(desc));
    Insert.append(ephoxUi, button);
    return button;
  };

  var makeColumnHeader = makeButton('Make column header');
  var unmakeColumnHeader = makeButton('Unmake column header');
  var makeRowHeader = makeButton('makeRowHeader');
  var unmakeRowHeader = makeButton('unmakeRowHeader');

  var detection = function () {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
      var range = selection.getRangeAt(0);
      var fistElement = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;
      return Option.some(Element.fromDom(fistElement));
    } else {
      return Option.none();
    }
  };

  var newCell = function (prev) {
    var td = Element.fromTag('td');
    Insert.append(td, Element.fromText('?'));
    if (prev.colspan() === 1) Css.set(td, 'width', Css.get(prev.element(), 'width'));
    if (prev.rowspan() === 1) Css.set(td, 'height', Css.get(prev.element(), 'height'));
    return td;
  };

  var gap = function () {
    var td = Element.fromTag('td');
    Insert.append(td, Element.fromText('?'));
    return td;
  };

  var newRow = function (prev) {
    var tr = Element.fromTag('tr');
    return tr;
  };

  var replace = function (cell, tag, attrs) {
    var replica = Replication.copy(cell, tag);
    Obj.each(attrs, function (v, k) {
      if (v !== null) Attr.set(replica, k, v);
    });
    return replica;
  };

  var generators = {
    row: newRow,
    cell: newCell,
    replace: replace,
    gap: gap
  };

  var runOperation = function (operation) {
    return function (event) {
      detection().each(function (start) {
        var dir = Direction.getDirection(start);
        var direction = dir === 'rtl' ? ResizeDirection.rtl : ResizeDirection.ltr;
        var target = {
          element: Fun.constant(start),
          mergable: Option.none,
          unmergable: Option.none,
          selection: Fun.constant([start])
        };

        //wire, table, target, generators, direction
        operation(ResizeWire.only(ephoxUi), SelectorFind.ancestor(start, 'table').getOrDie(), target, generators, direction);
      });
    };
  };

  DomEvent.bind(afterRow, 'click', runOperation(TableOperations.insertRowAfter));
  DomEvent.bind(beforeRow, 'click', runOperation(TableOperations.insertRowBefore));
  DomEvent.bind(beforeColumn, 'click', runOperation(TableOperations.insertColumnBefore));
  DomEvent.bind(afterColumn, 'click', runOperation(TableOperations.insertColumnAfter));

  DomEvent.bind(eraseRow, 'click', runOperation(TableOperations.eraseRows));
  DomEvent.bind(eraseColumn, 'click', runOperation(TableOperations.eraseColumns));

  DomEvent.bind(splitCellIntoColumns, 'click', runOperation(TableOperations.splitCellIntoColumns));
  DomEvent.bind(splitCellIntoRows, 'click', runOperation(TableOperations.splitCellIntoRows));

  DomEvent.bind(makeColumnHeader, 'click', runOperation(TableOperations.makeColumnHeader));
  DomEvent.bind(unmakeColumnHeader, 'click', runOperation(TableOperations.unmakeColumnHeader));
  DomEvent.bind(makeRowHeader, 'click', runOperation(TableOperations.makeRowHeader));
  DomEvent.bind(unmakeRowHeader, 'click', runOperation(TableOperations.unmakeRowHeader));
};