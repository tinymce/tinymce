define(
  'ephox.darwin.demo.DarwinTableDemo',

  [
    'ephox.darwin.api.TableKeys',
    'ephox.darwin.api.TableMouse',
    'ephox.darwin.mouse.CellSelection',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Replication',
    'ephox.sugar.api.SelectorFind',
    'global!Math',
    'global!document'
  ],

  function (TableKeys, TableMouse, CellSelection, PlatformDetection, SelectionRange, Situ, WindowSelection, Awareness, Fun, Option, Attr, Body, Compare, DomEvent, Element, Insert, Replication, SelectorFind, Math, document) {
    return function () {
      console.log('darwin table');

      var detection = PlatformDetection.detect();

      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
      Attr.set(ephoxUi, 'contenteditable', 'true');

      var style = Element.fromHtml(
        '<style>' +
          'table { border-collapse: collapse; }\n' +
          'td { text-align: center; border: 1px solid #aaa; font-size: 20px; padding: 10px; }\n' +
          'td.ephox-darwin-selected { background: #cadbee; }\n' +
          '#coords { position: fixed; right: 0px; bottom: 0px; background: #ddd }' +
        '</style>'
      );

      var table = Element.fromHtml(
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td style="min-width: 100px;">A1</td>' +
              '<td style="min-width: 100px;">B1<br /></td>' +
              '<td style="min-width: 100px;">C1<br /><br /><br /></td>' +
              '<td style="min-width: 100px;">D1</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="min-width: 100px;">A2</td>' +
              '<td style="min-width: 100px;">B2<br /><br /></td>' +
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

      var cloneDiv = Element.fromTag('div');
      Attr.set(cloneDiv, 'contenteditable', 'true');
      var clone = Replication.deep(table);
      Insert.append(cloneDiv, clone);
      Insert.append(Body.body(), cloneDiv);

      Insert.append(Body.body(), Element.fromHtml('<span id="coords">(0, 0)</span>'));
      DomEvent.bind(Body.body(), 'mousemove', function (event) {
        document.querySelector('#coords').innerHTML = '(' + event.raw().clientX + ', ' + event.raw().clientY + ')';
      });

      var handlers = TableMouse(ephoxUi);

      DomEvent.bind(ephoxUi, 'mousedown', handlers.mousedown);
      DomEvent.bind(ephoxUi, 'mouseover', handlers.mouseover);
      DomEvent.bind(ephoxUi, 'mouseup', handlers.mouseup);

      DomEvent.bind(ephoxUi, 'keyup', function (event) {
        console.log('keyup: ', event.raw().which);
        if (event.raw().which === 37 || event.raw().which === 39 || event.raw().which === 38 || event.raw().which === 40) {
          console.log('keyup');
          CellSelection.retrieve(ephoxUi).fold(function () {
            WindowSelection.get(window).each(function (sel) {
              console.log('has selection: ', sel.start().dom(), ' ', sel.soffset(), ' ', sel.finish().dom(), ' ', sel.foffset());
              if (! WindowSelection.isCollapsed(sel.start(), sel.soffset(), sel.finish(), sel.foffset())) {
                console.log('ranged', sel.start(), sel.finish());
                // we aren't collapsed ... so see if we are in two different cells.
                SelectorFind.closest(sel.start(), 'td,th').each(function (s) {
                  console.log('s', s.dom());
                  SelectorFind.closest(sel.finish(), 'td,th').each(function (f) {
                    console.log('f', f.dom());
                    if (! Compare.eq(s, f)) {
                      var boxes = CellSelection.identify(s, f).getOr([]);
                      console.log('boxes:' , boxes);
                      if (boxes.length > 0) {
                        CellSelection.selectRange(ephoxUi, boxes, s, f);
                        WindowSelection.setExact(window, s, 0, s, Awareness.getEnd(s));
                      }
                    }
                  });
                });
              }
            });
          }, function () { });
        }
      });

      DomEvent.bind(ephoxUi, 'keydown', function (event) {
        WindowSelection.get(window).each(function (sel) {
          // Let's branch on whether or not we have a table selection mode.
          CellSelection.retrieve(ephoxUi).fold(function () {
            // IE handles this properly ... so let's just exit.


            if (event.raw().which === 40 || event.raw().which === 38) {
              if (detection.browser.isIE()) return Option.none();


              var mover = event.raw().which === 40 ? TableKeys.handleDown : TableKeys.handleUp;
              mover(window, Fun.constant(false), sel.finish(), sel.foffset()).each(function (exact) {

                // Let's just try and intercept it here.
                if (event.raw().shiftKey) {
                  // We are doing selection ... so let's select.
                  SelectorFind.closest(sel.start(), 'td,th').bind(function (startCell) {
                    return SelectorFind.closest(exact.start(), 'td,th').bind(function (finishCell) {
                      if (! Compare.eq(startCell, finishCell)) {
                        return CellSelection.identify(startCell, finishCell).map(function (bb) {
                          return {
                            boxes: Fun.constant(bb),
                            finish: Fun.constant(finishCell),
                            start: Fun.constant(startCell)
                          };
                        });
                      } else {
                        return Option.none();
                      }
                    });
                  }).fold(function () {
                    WindowSelection.set(window, SelectionRange.write(
                      Situ.on(sel.start(), sel.soffset()),
                      Situ.on(exact.start(), exact.soffset())
                    ));
                  }, function (info) {
                    // Maybe care about boxes.length > 0
                    CellSelection.selectRange(ephoxUi, info.boxes(), info.start(), info.finish());
                    WindowSelection.set(window, SelectionRange.write(
                      Situ.on(exact.start(), exact.soffset()),
                      Situ.on(exact.start(), exact.soffset())
                    ));
                  });
                } else {
                  WindowSelection.set(window, SelectionRange.write(
                    Situ.on(exact.start(), exact.soffset()),
                    Situ.on(exact.start(), exact.soffset())
                  ));
                }
                event.kill();
                console.log('next', exact.start().dom(), exact.soffset(), exact.start().dom().childNodes.length);
              });
            }
          }, function (selected) {

            var update = function (newSels) {
              CellSelection.clear(ephoxUi);
              CellSelection.selectRange(ephoxUi, newSels.boxes(), newSels.start(), newSels.finish());
            };

            // ignoring bias for the time being.
            if (event.raw().shiftKey && event.raw().which >= 37 && event.raw().which <= 40) {
              if (event.raw().which === 39) CellSelection.shiftSelection(selected, 0, +1).each(update);
              else if (event.raw().which === 37) CellSelection.shiftSelection(selected, 0, -1).each(update);
              else if (event.raw().which === 38) CellSelection.shiftSelection(selected, -1, 0).each(update);
              else if (event.raw().which === 40) CellSelection.shiftSelection(selected, +1, 0).each(update);
              console.log('this is where you would handle expanding the table selection');
              event.kill();
            } else if (event.raw().shiftKey === false) {
              CellSelection.clear(ephoxUi);
            }
          });
        });
      });
    };
  }
);