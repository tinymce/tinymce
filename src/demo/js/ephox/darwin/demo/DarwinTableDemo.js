define(
  'ephox.darwin.demo.DarwinTableDemo',

  [
    'ephox.compass.Arr',
    'ephox.darwin.api.Darwin',
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

  function (Arr, Darwin, SelectionRange, Situ, WindowSelection, Awareness, Fun, Option, DomParent, Class, Compare, DomEvent, Element, Insert, SelectorFilter, SelectorFind, Math, document) {
    return function () {
      console.log('darwin table');

      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var style = Element.fromHtml(
        '<style>' +
          'table { border-collapse: collapse; }\n' +
          'td { text-align: center; border: 1px solid #aaa; font-size: 20px; padding: 10px; }\n' +
          'td.selected { background: #cadbee; }\n' +
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
              '<td style="min-width: 100px;">C2</td>' +
              '<td style="min-width: 100px;">D2</td>' +
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

      var findInTable = function (container, cell) {
        return findColumn(cell).bind(function (colIndex) {
          return findRow(cell).map(function (rowIndex) {
            return {
              rowIndex: Fun.constant(rowIndex),
              colIndex: Fun.constant(colIndex),
            };
          });
        });
      };

      var findColumn = function (cell) {
        return SelectorFind.ancestor(cell, 'tr').bind(function (tr) {
          var cells = SelectorFilter.descendants(tr, 'td,th');
          var isElem = Fun.curry(Compare.eq, cell);
          var index = Arr.findIndex(cells, isElem);
          return index !== -1 ? Option.some(index) : Option.none();
        });
      };

      var findRow = function (cell) {
        return SelectorFind.ancestor(cell, 'tbody,thead').bind(function (section) {
          return SelectorFind.ancestor(cell, 'tr').bind(function (row) {
            var rows = SelectorFilter.descendants(section, 'tr');
            var isRow = Fun.curry(Compare.eq, row);
            var index = Arr.findIndex(rows, isRow);
            return index !== -1 ? Option.some(index) : Option.none();
          });
        });
      };

      var lookupTable = function (scope) {
        return SelectorFind.ancestor(scope, 'table');
      };

      var boxIt = function (start, finish) {
        // Check they have the same table.
        return DomParent.sharedOne(lookupTable, [ start, finish ]).bind(function (tbl) {
          // For all the rows, identify the information.
          var rows = SelectorFilter.descendants(tbl, 'tr');
          return findInTable(tbl, start).bind(function (startData) {
            return findInTable(tbl, finish).map(function (finishData) {
              console.log('startData', startData, 'finishData', finishData);
              var minRowIndex = Math.min(startData.rowIndex(), finishData.rowIndex());
              var maxRowIndex = Math.max(startData.rowIndex(), finishData.rowIndex());
              var subrows = rows.slice(minRowIndex, maxRowIndex + 1);
              console.log('subrows', Arr.map(subrows, function (r) { return r.dom(); }));
              return Arr.bind(subrows, function (r) {
                var cells = SelectorFilter.children(r, 'td,th');
                var minCellIndex = Math.min(startData.colIndex(), finishData.colIndex());
                var maxCellIndex = Math.max(startData.colIndex(), finishData.colIndex());
                var blah = cells.slice(minCellIndex, maxCellIndex + 1);
                console.log('blah', Arr.map(blah, function (b) { return b.dom(); }));
                return blah;
              });
            });
          });
        });
      };

      var magic = function () {
        var cursor = Option.none();
        DomEvent.bind(table, 'mousedown', function (event) {
          var selected = SelectorFilter.descendants(table, '.selected');
          Arr.each(selected, function (td) {
            Class.remove(td, 'selected');
          });


          cursor = SelectorFind.closest(event.target(), 'td,th');
          console.log('mousedown');
        });

        DomEvent.bind(table, 'mouseover', function (event) {

          var boxes = cursor.bind(function (cur) {
            var selected = SelectorFilter.descendants(table, '.selected');
            Arr.each(selected, function (td) {
              Class.remove(td, 'selected');
            });

            var boxes = SelectorFind.closest(event.target(), 'td,th').bind(function (finish) {
              console.log('start', cur.dom(), 'finish', finish.dom());
              return boxIt(cur, finish);
            }).getOr([]);

            if (boxes.length > 0) {
              console.log('boxing');
              Arr.each(boxes, function (box) {
                Class.add(box, 'selected');
              });

              window.getSelection().removeAllRanges();
            }
            console.log('mouseover', boxes);
          });
        });

        DomEvent.bind(table, 'mouseup', function (event) {
          cursor = Option.none();
        });

        var haxy = function (newCell, oldCell) {
          SelectorFind.closest(newCell, 'tr').bind(function (r1) {
            SelectorFind.closest(oldCell, 'tr').bind(function (r2) {
              // If we are in the same row, then we need to jump down.
              if (Compare.eq(r1, r2)) {
                // the rows are the same ... so find the equivalent cell.
                // trigger down again on row.
                return Darwin.tryDonw(window, Fun.constant(false), oldCell, Awareness.getEnd(oldCell));
              } else {
                // We don't need to do any jumping.
                return Option.none();
              }
            });
          });
        };

        var isRow = function (elem) {
          return SelectorFind.closest(elem, 'tr');
        };

        var hacker = function (mover, element, offset) {
          return mover(window, Fun.constant(false), element, offset).bind(function (next) {
            var exact = WindowSelection.deriveExact(window, next);
              // Note, this will only work if we are staying in a table.
            return SelectorFind.closest(exact.start(), 'td,th').bind(function (newCell) {
              return SelectorFind.closest(element, 'td,th').bind(function (oldCell) {
                if (! Compare.eq(newCell, oldCell)) {
                  return DomParent.sharedOne(isRow, [ newCell, oldCell ]).fold(function () {
                    return Option.some(next);
                  }, function (sharedRow) {
                    return hacker(mover, oldCell, mover === Darwin.tryDown ? Awareness.getEnd(oldCell) : 0);
                  });
                } else {
                  return Option.none();
                }
              });
            });
          });
        };

        DomEvent.bind(table, 'keydown', function (event) {
          WindowSelection.get(window).each(function (sel) {
            if (event.raw().which === 40 || event.raw().which === 38) {
              var mover = event.raw().which === 40 ? Darwin.tryDown : Darwin.tryUp;
              hacker(mover, sel.finish(), sel.foffset()).each(function (next) {
                var exact = WindowSelection.deriveExact(window, next);
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