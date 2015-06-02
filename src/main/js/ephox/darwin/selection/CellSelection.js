define(
  'ephox.darwin.selection.CellSelection',

  [
    'ephox.compass.Arr',
    'ephox.darwin.api.Ephemera',
    'ephox.darwin.navigation.CellFinder',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.dom.DomParent',
    'ephox.snooker.selection.Rectangular',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.OnNode',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'global!Math'
  ],

  function (Arr, Ephemera, CellFinder, Fun, Option, DomParent, Rectangular, Class, OnNode, SelectorFilter, SelectorFind, Math) {
    var clear = function (container) {
      var sels = SelectorFilter.descendants(container, '.' + Ephemera.selectedClass());
      Arr.each(sels, OnNode.removeClasses([ Ephemera.selectedClass(), Ephemera.lastSelectedClass(), Ephemera.firstSelectedClass() ]));
    };

    var select = function (cells) {
      Arr.each(cells, OnNode.addClass(Ephemera.selectedClass()));
    };

    var lookupTable = function (container) {
      return SelectorFind.ancestor(container, 'table');
    };

    // Note, bIndex is not necessarily higher than aIndex
    var sliceInterval = function (xs, aIndex, bIndex) {
      var minRowIndex = Math.min(aIndex, bIndex);
      var maxRowIndex = Math.max(aIndex, bIndex);
      return xs.slice(minRowIndex, maxRowIndex + 1);
    };

    var identify = function (start, finish) {
      // So ignore the colspan, rowspan for the time being.
      return DomParent.sharedOne(lookupTable, [ start, finish ]).bind(function (tbl) {
        console.log('table', tbl);
        return Rectangular.getBox(tbl, start, finish).map(function (info) {
          var all = Arr.bind(info.warehouse.all(), function (r) { return r.cells(); });
          var filtered = Arr.filter(all, function (detail) {
            // Taken from spanning cells.
      //       var cellFinishRow = cell.row() + cell.rowspan()-1;
      // var cellFinishCol = cell.column() + cell.colspan()-1;
      // var cellStartRow = cell.row();
      // var cellStartCol = cell.column();

      // return  cellStartCol >= check.startCol() &&
      //         cellFinishCol <= check.finishCol() &&
      //         cellStartRow >= check.startRow() &&
      //         cellFinishRow <= check.finishRow();
            return (
              (detail.column() >= info.startCol() && detail.column()  <= info.finishCol()) ||
              (detail.column() + detail.colspan() - 1 >= info.startCol() && detail.column() + detail.colspan() - 1 <= info.finishCol())
            ) && (
              (detail.row() >= info.startRow() && detail.row() <= info.finishRow()) ||
              (detail.row() + detail.rowspan() - 1 >= info.startRow() && detail.row() + detail.rowspan() - 1 <= info.finishRow())
            );
          });

          return Arr.map(filtered, function (f) { return f.element(); });
        });

        // var findInWarehouse = function (cell) {
        //   return Option.from(Arr.find(Obj.values(access), function (a) {
        //     return Compare.eq(a.element(), cell);
        //   }));
        // }

        // var list = DetailsList.fromTable(tbl);

        // var warehouse = Warehouse.generate(list);

        // var startDetail = findInWarehouse(start);
        // var finishDetail = findInWarehouse(finish);

        // return startDetail.bind(function (sDetail) {
        //   return finishDetail.bind(function (fDetail) {
        //     var minRow = Math.min(sDetail.row(), fDetail.row());
        //     var maxRow = Math.max(sDetail.row() + sDetail.rowspan()
        //   });
        // });


        // // For all the rows, identify the information.
        // var rows = SelectorFilter.descendants(tbl, 'tr');
        // return CellFinder.findInTable(start).bind(function (startData) {
        //   return CellFinder.findInTable(finish).map(function (finishData) {
        //     var subrows = sliceInterval(rows, startData.rowIndex(), finishData.rowIndex());
        //     return Arr.bind(subrows, function (r) {
        //       var cells = SelectorFilter.children(r, 'td,th');
        //       return sliceInterval(cells, startData.colIndex(), finishData.colIndex());
        //     });
        //   });
        // });
      });
    };

    var retrieve = function (container) {
      var sels = SelectorFilter.descendants(container, '.' + Ephemera.selectedClass());
      return sels.length > 0 ? Option.some(sels) : Option.none();
    };

    var getLast = function (boxes) {
      var raw = Arr.find(boxes, OnNode.hasClass(Ephemera.lastSelectedClass()));
      return Option.from(raw);
    };

    var expandTo = function (finish) {
      return SelectorFind.ancestor(finish, 'table').bind(function (table) {
        return SelectorFind.descendant(table, '.' + Ephemera.firstSelectedClass()).bind(function (start) {
          return identify(start, finish).map(function (boxes) {
            console.log('boxes: ', boxes);
            return {
              boxes: Fun.constant(boxes),
              start: Fun.constant(start),
              finish: Fun.constant(finish)
            };
          });
        });
      });
    };

    var shiftSelection = function (boxes, deltaRow, deltaColumn) {
      console.log('shifting');
      return getLast(boxes).bind(function (last) {
        return CellFinder.avocado(last, deltaRow, deltaColumn).bind(expandTo);
        // return CellFinder.findInTable).bind(function (position) {
        // console.log('position: ', position.rowIndex(), position.colIndex());
        // return SelectorFind.ancestor(boxes[0], 'table').bind(function (table) {
        //   return CellFinder.gotoCell(table, position.rowIndex() + deltaRow, position.colIndex() + deltaColumn).bind(expandTo);
        // });
      });
    };

    var isSelected = function (cell) {
      return Class.has(cell, Ephemera.selectedClass());
    };

    var selectRange = function (container, cells, start, finish) {
      clear(container);
      select(cells);
      Class.add(start, Ephemera.firstSelectedClass());
      Class.add(finish, Ephemera.lastSelectedClass());
    };

    return {
      clear: clear,
      identify: identify,
      retrieve: retrieve,
      shiftSelection: shiftSelection,
      isSelected: isSelected,
      selectRange: selectRange
    };
  }
);