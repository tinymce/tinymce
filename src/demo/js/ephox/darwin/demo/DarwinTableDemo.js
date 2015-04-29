define(
  'ephox.darwin.demo.DarwinTableDemo',

  [
    'ephox.compass.Arr',
    'ephox.darwin.api.Darwin',
    'ephox.darwin.api.TableKeys',
    'ephox.darwin.mouse.CellSelection',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.dom.DomParent',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'global!Math',
    'global!document'
  ],

  function (Arr, Darwin, TableKeys, CellSelection, SelectionRange, Situ, WindowSelection, Awareness, Fun, Option, DomParent, Class, Compare, DomEvent, Element, Insert, SelectorFilter, SelectorFind, Math, document) {
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


      var magic = function () {
        var cursor = Option.none();
        DomEvent.bind(table, 'mousedown', function (event) {
          CellSelection.clear(table);
          cursor = SelectorFind.closest(event.target(), 'td,th');
        });

        DomEvent.bind(table, 'mouseover', function (event) {

          var boxes = cursor.bind(function (cur) {
            CellSelection.clear(table);

            var boxes = SelectorFind.closest(event.target(), 'td,th').bind(function (finish) {
              return CellSelection.identify(cur, finish);
            }).getOr([]);

            if (boxes.length > 0) {
              CellSelection.select(boxes);
              window.getSelection().removeAllRanges();
            }
          });
        });

        DomEvent.bind(table, 'mouseup', function (event) {
          cursor = Option.none();
        });

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

      magic();
    };
  }
);