import { Fun, Obj, Optional, Optionals } from '@ephox/katamari';
import { Attribute, Css, DomEvent, EventArgs, Insert, InsertAll, Ready, Replication, SelectorFind, SugarElement, SugarNode } from '@ephox/sugar';

import { Generators } from 'ephox/snooker/api/Generators';
import * as ResizeBehaviour from 'ephox/snooker/api/ResizeBehaviour';
import { ResizeWire } from 'ephox/snooker/api/ResizeWire';
import * as TableOperations from 'ephox/snooker/api/TableOperations';
import { TableResize } from 'ephox/snooker/api/TableResize';
import { TableSize } from 'ephox/snooker/api/TableSize';
import { OperationCallback, TargetElement, TargetSelection } from 'ephox/snooker/model/RunOperation';

Ready.document(() => {

  const tester = SugarElement.fromHtml<HTMLTableElement>(
    '<table border=1>' +
      '<tr>' +
        '<th>A0</th>' +
        '<th>A1</th>' +
        '<th>A2</th>' +
        '<th>A3</th>' +
        '<th>A4</th>' +
      '</tr>' +
      '<tr>' +
        '<td>B0</td>' +
        '<td>B1</td>' +
        '<td>B2</td>' +
        '<td>B3</td>' +
        '<td rowspan="2">B3</td>' +
      '</tr>' +
      '<tr>' +
        '<td>C0</td>' +
        '<td>C1</td>' +
        '<td>C2</td>' +
        '<td>C3</td>' +
      '</tr>' +
    '</table>'
  );

  // const subject = SugarElement.fromHtml(
  //   '<table contenteditable="true" style="border-collapse: collapse;" border="1"><tbody>' +
  //     '<tr>' +
  //       '<td style="width: 110px;">1</td>' +
  //       '<td colspan="5">.</td>' +
  //     '</tr>' +
  //     '<tr>' +
  //       '<td colspan=2>.</td>' +
  //       '<td style="width: 130px;">3</td>' +
  //       '<td colspan=2>.</td>' +
  //       '<td style="width: 160px;">6</td>' +
  //     '</tr>' +
  //     '<tr>' +
  //       '<td colspan=3>.</td>' +
  //       '<td style="width: 140px;">4</td>' +
  //       '<td colspan=2>.</td>' +
  //     '</tr>' +
  //     '<tr>' +
  //       '<td colspan=4>.</td>' +
  //       '<td colspan=2>.</td>' +
  //     '</tr>' +
  //     '<tr>' +
  //       '<td rowspan=2>x</td>' +
  //       '<td style="width: 120px;">2</td>' +
  //       '<td colspan=2>.</td>' +
  //       '<td style="width: 150px;">5</td>' +
  //       '<td>x</td>' +
  //     '</tr>' +
  //     '<tr>' +
  //       '<td style="width: 120px;" rowspan=2>2</td>' +
  //       '<td colspan=2>.</td>' +
  //       '<td style="width: 150px;">5</td>' +
  //       '<td>x</td>' +
  //     '</tr>' +
  //     '<tr>' +
  //       '<td>1</td>' +
  //       '<td colspan=2>.</td>' +
  //       '<td style="width: 150px;">5</td>' +
  //       '<td>x</td>' +
  //     '</tr>' +
  //   '</tbody></table>'
  // );

  // subject = SugarElement.fromHtml('<table contenteditable="true" style="border-collapse: collapse;"><tbody><tr><td>A</td><td>A2</td></tr><tr><td rowspan=2>B</td><td>C</td></tr><tr><td>d</td></tr></tbody></table>');
  // subject = SugarElement.fromHtml('<table contenteditable="true" style="border-collapse: collapse;"><tbody><tr><td>A</td></tr><tr><td rowspan=2>B</td></tr></tbody></table>');

  const subject2 = SugarElement.fromHtml<HTMLTableElement>(
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

  const subject3 = SugarElement.fromHtml<HTMLTableElement>(
    '<table contenteditable="true" width="100%" cellpadding="0" border="1" cellspacing="0"> ' +
    '<tbody>' +
    '<tr> ' +
    '<td rowspan="2" width="34%">&nbsp;a</td> ' +
    '<td width="33%">&nbsp;b</td> ' +
    '<td width="33%">&nbsp;c</td> ' +
    '</tr> ' +
    '<tr> ' +
    '<td width="33%">&nbsp;d</td> ' +
    '<td rowspan="2" width="33%">&nbsp;e</td> ' +
    '</tr> ' +
    '<tr> ' +
    '<td width="34%">&nbsp;f</td> ' +
    '<td width="33%">&nbsp;g</td> ' +
    '</tr> ' +
    '<tr> ' +
    '<td width="34%">&nbsp;h</td> ' +
    '<td width="33%">&nbsp;i</td> ' +
    '<td width="33%">j&nbsp;</td> ' +
    '</tr> ' +
    '</tbody>' +
    '</table>');

  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
  const ltrs = SugarElement.fromHtml<HTMLDivElement>('<div class="ltrs"></div>');
  InsertAll.append(ltrs, [ SugarElement.fromHtml('<p>Left to Right tables</p>'), tester, SugarElement.fromTag('p'), subject2 ]);
  const rtls = SugarElement.fromHtml<HTMLDivElement>('<div dir="rtl"></div>');
  InsertAll.append(rtls, [ SugarElement.fromHtml('<p>Right to Left table</p>'), subject3 ]);
  InsertAll.append(ephoxUi, [ ltrs, rtls ]);

  const lazyTableSize = (table: SugarElement<HTMLTableElement>) => TableSize.getTableSize(table);
  const isResizable = Fun.always;
  const ltrManager = TableResize.create(ResizeWire.body(tester, ltrs, isResizable), ResizeBehaviour.preserveTable(), lazyTableSize);
  ltrManager.on();
  const rtlManager = TableResize.create(ResizeWire.body(subject3, rtls, isResizable), ResizeBehaviour.preserveTable(), lazyTableSize);
  rtlManager.on();

  // For firefox.
  // eslint-disable-next-line @tinymce/prefer-fun
  Ready.document(() => {
    // document.execCommand("enableInlineTableEditing", null, false);
    // document.execCommand("enableObjectResizing", false, "false");
  });

  const afterRow = SugarElement.fromTag('button');
  Insert.append(afterRow, SugarElement.fromText('Row After'));
  Insert.append(ephoxUi, afterRow);

  const beforeRow = SugarElement.fromTag('button');
  Insert.append(beforeRow, SugarElement.fromText('Row Before'));
  Insert.append(ephoxUi, beforeRow);

  const afterColumn = SugarElement.fromTag('button');
  Insert.append(afterColumn, SugarElement.fromText('Column After'));
  Insert.append(ephoxUi, afterColumn);

  const beforeColumn = SugarElement.fromTag('button');
  Insert.append(beforeColumn, SugarElement.fromText('Column Before'));
  Insert.append(ephoxUi, beforeColumn);

  const splitCellIntoColumns = SugarElement.fromTag('button');
  Insert.append(splitCellIntoColumns, SugarElement.fromText('Split Cell Into Columns'));
  Insert.append(ephoxUi, splitCellIntoColumns);

  const splitCellIntoRows = SugarElement.fromTag('button');
  Insert.append(splitCellIntoRows, SugarElement.fromText('Split Cell Into Rows'));
  Insert.append(ephoxUi, splitCellIntoRows);

  const eraseRow = SugarElement.fromTag('button');
  Insert.append(eraseRow, SugarElement.fromText('Erase row'));
  Insert.append(ephoxUi, eraseRow);

  const eraseColumn = SugarElement.fromTag('button');
  Insert.append(eraseColumn, SugarElement.fromText('Erase column'));
  Insert.append(ephoxUi, eraseColumn);

  const makeButton = (desc: string) => {
    const button = SugarElement.fromTag('button');
    Insert.append(button, SugarElement.fromText(desc));
    Insert.append(ephoxUi, button);
    return button;
  };

  const makeColumnHeader = makeButton('Make column header');
  const unmakeColumnHeader = makeButton('Unmake column header');
  const makeRowHeader = makeButton('Make row header');
  const makeRowBody = makeButton('Unmake row header');

  const detection = (): Optional<SugarElement<Element>> =>
    Optional.from(window.getSelection()).bind((selection) => {
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const firstElement = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;
        return Optionals.mapFrom(firstElement, SugarElement.fromDom).filter(SugarNode.isElement);
      } else {
        return Optional.none();
      }
    });

  const newCell: Generators['cell'] = (prev) => {
    const td = SugarElement.fromTag('td');
    Insert.append(td, SugarElement.fromText('?'));
    if (prev.colspan === 1) {
      Css.set(td, 'width', Css.get(prev.element, 'width'));
    }
    if (prev.rowspan === 1) {
      Css.set(td, 'height', Css.get(prev.element, 'height'));
    }
    return td;
  };

  const gap: Generators['gap'] = () => {
    const td = SugarElement.fromTag('td');
    Insert.append(td, SugarElement.fromText('?'));
    return td;
  };

  const newRow: Generators['row'] = () => {
    return SugarElement.fromTag('tr');
  };

  const replace: Generators['replace'] = (cell, tag, attrs) => {
    const replica = Replication.copy(cell, tag);
    Obj.each(attrs, (v, k) => {
      if (v !== null) {
        Attribute.set(replica, k, v);
      }
    });
    return replica;
  };

  const col: Generators['col'] = () => SugarElement.fromTag('col');
  const colgroup: Generators['colgroup'] = () => SugarElement.fromTag('colgroup');

  const generators: Generators = {
    row: newRow,
    cell: newCell,
    replace,
    gap,
    col,
    colGap: col as Generators['colGap'],
    colgroup
  };

  const runOperation = (operation: OperationCallback<TargetElement & TargetSelection>) => {
    return (_event: EventArgs) => {
      detection().each((start) => {
        const target = {
          element: start,
          selection: [ start ]
        };

        // wire, table, target, generators, direction
        const table = SelectorFind.ancestor(start, 'table').getOrDie() as SugarElement<HTMLTableElement>;
        const tableSize = TableSize.getTableSize(table);
        operation(table, target, generators, { sizing: tableSize });
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
  DomEvent.bind(makeRowBody, 'click', runOperation(TableOperations.makeRowBody));
});
