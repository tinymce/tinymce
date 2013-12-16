define(
  'ephox.snooker.demo.DetectDemo',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.snooker.data.Structs',
    'ephox.snooker.operate.ColumnInsertion',
    'ephox.snooker.operate.RowInsertion',
    'ephox.snooker.operate.TableOperation',
    'ephox.snooker.resize.Adjustments',
    'ephox.snooker.resize.BarManager',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Ready',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Option, Structs, ColumnInsertion, RowInsertion, TableOperation, Adjustments, BarManager, Compare, Css, DomEvent, Element, Insert, Node, Ready, SelectorFind) {
    return function () {
      var subject = Element.fromHtml(
        '<table contenteditable="true" style="border-collapse: collapse;"><tbody>' +
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
            '<td style="width: 120px;">2</td>' +
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
            '<td colspan="4">.</td>' +
          '</tr>' +
          '<tr>' +
            '<td>x</td>' +
            '<td style="width: 120px;">2</td>' +
            '<td>.</td>' +
            '<td style="width: 150px;">5</td>' +
            '<td>x</td>' +
          '</tr>' +
        '</tbody></table>'
      );


      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
      Insert.append(ephoxUi, subject);
      Insert.append(ephoxUi, subject2);

      var manager = BarManager(ephoxUi);
      manager.events.adjustWidth.bind(function (event) {
        Adjustments.adjust(event.table(), event.delta(), event.column());
      });
      manager.on();

      // manager.refresh(subject);

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

      var deleteButton = Element.fromTag('button');
      Insert.append(deleteButton, Element.fromText('X'));
      Insert.append(ephoxUi, deleteButton);

      var detection = function () {
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
          var range = selection.getRangeAt(0);
          var start = Element.fromDom(range.startContainer);
          return Arr.contains([ 'td', 'th' ], Node.name(start)) ? Option.some(start) : SelectorFind.ancestor(start, 'th,td');
        } else {
          return Option.none();
        }
      };

      var newCell = function (prev) {
        var td = Element.fromTag('td');
        Insert.append(td, Element.fromText('?'));
        if (prev.colspan() === 1) Css.set(td, 'width', Css.get(prev.element(), 'width'));
        if (prev.rowspan() === 1) Css.set(td, 'height', Css.get(prev.element(), 'height'));
        return Structs.detail(td, 1, 1);
      };

      var newRow = function (prev) {
        var tr = Element.fromTag('tr');
        return Structs.detail(tr, 1, 1);
      };

      var eq = Compare.eq;

      DomEvent.bind(afterRow, 'click', function (event) {
        detection().each(function (cell) {
          TableOperation.run(ephoxUi, subject, cell, function (warehouse, gridpos) {
            return RowInsertion.insertAfter(warehouse, gridpos.row(), gridpos.column(), newRow, newCell, eq);
          });
        });
      });

      DomEvent.bind(beforeRow, 'click', function (event) {
        detection().each(function (cell) {
          TableOperation.run(ephoxUi, subject, cell, function (warehouse, gridpos) {
            return RowInsertion.insertBefore(warehouse, gridpos.row(), gridpos.column(), newRow, newCell, eq);
          });
        });
      });

      DomEvent.bind(beforeColumn, 'click', function (event) {
        detection().each(function (cell) {
          TableOperation.run(ephoxUi, subject, cell, function (warehouse, gridpos) {
            return ColumnInsertion.insertBefore(warehouse, gridpos.row(), gridpos.column(), newCell);
          });
        });
      });

      DomEvent.bind(afterColumn, 'click', function (event) {
        detection().each(function (cell) {
          TableOperation.run(ephoxUi, subject, cell, function (warehouse, gridpos) {
            return ColumnInsertion.insertAfter(warehouse, gridpos.row(), gridpos.column(), newCell);
          });
        });
      });

      DomEvent.bind(deleteButton, 'click', function (event) {
        detection().each(function (cell) {
          TableOperation.run(ephoxUi, subject, cell, function (warehouse, gridpos) {
            return ColumnInsertion.erase(warehouse, gridpos.column(), gridpos.row());
          });
        });
      });
    };
  }
);
