define(
  'ephox.darwin.demo.DarwinTableDemo',

  [
    'ephox.darwin.api.TableKeys',
    'ephox.darwin.api.TableMouse',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.fussy.api.WindowSelection',
    'ephox.peanut.Fun',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFind',
    'global!Math',
    'global!document'
  ],

  function (TableKeys, TableMouse, SelectionRange, Situ, WindowSelection, Fun, DomEvent, Element, Insert, SelectorFind, Math, document) {
    return function () {
      console.log('darwin table');

      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var style = Element.fromHtml(
        '<style>' +
          'table { border-collapse: collapse; }\n' +
          'td { text-align: center; border: 1px solid #aaa; font-size: 20px; padding: 10px; }\n' +
          'td.ephox-darwin-selected { background: #cadbee; }\n' +
        '</style>'
      );

      var table = Element.fromHtml(
        '<table contenteditable="true">' +
          '<tbody>' +
            '<tr>' +
              '<td style="min-width: 100px;">A1</td>' +
              '<td style="min-width: 100px;">B1<br /></td>' +
              '<td style="min-width: 100px;">C1<br /><br /><br /></td>' +
              '<td style="min-width: 100px;">D1</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="min-width: 100px;">A2</td>' +
              '<td style="min-width: 100px;">B2</td>' +
              '<td style="min-width: 100px;"><p>C2</p><p>More</p></td>' +
              '<td style="min-width: 100px;"><br />D2</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="min-width: 100px;">A3</td>' +
              '<td style="min-width: 100px;">B3</td>' +
              '<td style="min-width: 100px;">C3</td>' +
              '<td style="min-width: 100px;">D3</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      Insert.append(ephoxUi, table);
      Insert.append(Element.fromDom(document.head), style);

      var handlers = TableMouse(ephoxUi);

      DomEvent.bind(ephoxUi, 'mousedown', handlers.mousedown);
      DomEvent.bind(ephoxUi, 'mouseover', handlers.mouseover);
      DomEvent.bind(ephoxUi, 'mouseup', handlers.mouseup);


      DomEvent.bind(table, 'keydown', function (event) {
        WindowSelection.get(window).each(function (sel) {
          if (event.raw().which === 40 || event.raw().which === 38) {
            var mover = event.raw().which === 40 ? TableKeys.handleDown : TableKeys.handleUp;
            mover(window, Fun.constant(false), sel.finish(), sel.foffset()).each(function (exact) {
              WindowSelection.set(window, SelectionRange.write(
                event.raw().shiftKey ? Situ.on(sel.start(), sel.soffset()) : Situ.on(exact.start(), exact.soffset()),
                Situ.on(exact.start(), exact.soffset())
              ));
              event.kill();
              console.log('next', exact.start().dom(), exact.soffset(), exact.start().dom().childNodes.length);
            });
          }
        });
      });
    };
  }
);