define(
  'ephox.snooker.demo.DetectDemo',

  [
    'ephox.perhaps.Option',
    'ephox.snooker.api.TableOperations',
    'ephox.snooker.api.TableResize',
    'ephox.snooker.data.Structs',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Ready',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Option, TableOperations, TableResize, Structs, Compare, Css, DomEvent, Element, Insert, Ready, SelectorFind) {
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

      var manager = TableResize(ephoxUi);
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

      var detection = function () {
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
          var range = selection.getRangeAt(0);
          return Option.some(Element.fromDom(range.startContainer));
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

      var generators = {
        row: newRow,
        cell: newCell
      };

      var runOperation = function (operation) {
        return function (event) {
          detection().each(function (start) {
            operation(ephoxUi, start, generators);
          });
        };
      };

      DomEvent.bind(afterRow, 'click', runOperation(TableOperations.insertRowAfter));
      DomEvent.bind(beforeRow, 'click', runOperation(TableOperations.insertRowBefore));
      DomEvent.bind(beforeColumn, 'click', runOperation(TableOperations.insertColumnBefore));
      DomEvent.bind(afterColumn, 'click', runOperation(TableOperations.insertColumnAfter));
    };
  }
);
