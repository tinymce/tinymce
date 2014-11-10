define(
  'ephox.snooker.picker.PickerUi',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.api.Structs',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.picker.PickerStyles',
    'ephox.snooker.picker.Redimension',
    'ephox.snooker.style.Styles',
    'ephox.snooker.util.Util',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove'
  ],

  function (Arr, Fun, Event, Events, Structs, TableLookup, PickerStyles, Redimension, Styles, Util, Attr, Class, Classes, DomEvent, Element, Insert, InsertAll, Remove) {
    return function (settings) {
      var events = Events.create({
        select: Event(['rows', 'cols', 'rowHeaders', 'columnHeaders'])
      });

      var table = Element.fromTag('div');
      Class.add(table, PickerStyles.table());

      var size = { width: 0, height: 0};

      var element = function() {
        return table;
      };

      var destroy = function() {
        clicker.unbind();
        mover.unbind();
        Remove.remove(table);
      };

      var setSize = function (numRows, numCols) {
        size = { width: numCols, height: numRows };
        refresh();
      };

      var refresh = function () {
        Remove.empty(table);
        //create a set of trs, then for each tr, insert numCols tds
        var rows = Util.repeat(size.height, function () {
          var row = Element.fromTag('div');
          Class.set(row, PickerStyles.row());
          return row;
        });

        Arr.each(rows, function (row) {
          var cells = Util.repeat(size.width, function () {
            var td = Element.fromTag('span');
            Class.add(td, PickerStyles.cell());
            return td;
          });

          InsertAll.append(row, cells);
          Insert.append(table, row);
        });
      };

      var setHeaders = function (headerRows, headerCols) {
        Attr.set(table, 'data-picker-header-row', headerRows);
        Attr.set(table, 'data-picker-header-col', headerCols);
      };

      var inHeader = function (row, column) {
        var headers = TableLookup.grid(table, 'data-picker-header-row', 'data-picker-header-col');
        return row < headers.rows() || column < headers.columns();
      };

      var setSelection = function(numRows, numCols) {
        var allCells = TableLookup.cells(table);
        Arr.each(allCells, function(cell) {
          Class.remove(cell, Styles.resolve('picker-selected'));
        });

        var rows = TableLookup.rows(table).slice(0, numRows);
        Arr.each(rows, function (row, rindex) {
          var cells = TableLookup.cells(row).slice(0, numCols);
          Arr.each(cells, function (cell, cindex) {
            var classes = inHeader(rindex, cindex) ? [ Styles.resolve('picker-selected'), Styles.resolve('picker-header') ] : [ Styles.resolve('picker-selected') ];
            Classes.add(cell, classes);
          });
        });

        Attr.set(table, 'data-picker-col', numCols - 1);
        Attr.set(table, 'data-picker-row', numRows - 1);
      };

      var redimension = Redimension(settings);
      var mover = DomEvent.bind(table, 'mousemove', function (event) {
        var bridge = {
          element: Fun.constant(table),
          setSelection: setSelection,
          setSize: setSize
        };

        redimension.handle(bridge, Structs.grid(size.height, size.width), event.raw().pageX, event.raw().pageY);
      });

      var clicker = DomEvent.bind(table, 'click', function (event) {
        var result = TableLookup.grid(table, 'data-picker-row', 'data-picker-col');
        var headers = TableLookup.grid(table, 'data-picker-header-row', 'data-picker-header-col');
        events.trigger.select(result.rows() + 1, result.columns() + 1, headers.rows(), headers.columns());
        event.raw().preventDefault();
      });

      var reset = function () {
        setSize(settings.minRows, settings.minCols);
        setSelection(1, 1);
      };

      return {
        element: element,
        destroy: destroy,
        setSize: setSize,
        setHeaders: setHeaders,
        setSelection: setSelection,
        on: redimension.on,
        off: redimension.off,
        reset: reset,
        refresh: refresh,
        events: events.registry
      };
    };
  }
);
