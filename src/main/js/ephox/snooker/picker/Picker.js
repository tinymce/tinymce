define(
  'ephox.snooker.picker.Picker',

  [
    'ephox.compass.Arr',
    'ephox.dragster.api.Dragger',
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.adjust.Mutation',
    'ephox.snooker.picker.CellPosition',
    'ephox.snooker.style.Styles',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Width'
  ],

  function(Arr, Dragger, Option, Event, Events, Mutation, CellPosition, Styles, Attr, Class, DomEvent, Element, Height, Insert, InsertAll, Location, Node, Remove, SelectorFilter, SelectorFind, Width) {
    return function () {

      var MAX_ROWS = 10;
      var MIN_ROWS = 1;
      var MAX_COLS = 10;
      var MIN_COLS = 1;

      var events = Events.create({
        resize: Event([]),
        select: Event(['cols', 'rows'])
      });

      var table = Element.fromTag('table');
      Class.add(table, Styles.resolve('table-picker'));
      var tbody = Element.fromTag('tbody');
      Insert.append(table, tbody);

      var mutation = Mutation();
      var dragger = Dragger.transform(mutation, {});

      var size = { width: 0, height: 0};

      mutation.events.drag.bind(function (event) {
        console.log('event.xDelta', event.xDelta());
      });

      var repeat = function(repititions, f) {
        var r = [];
        for (var i = 0; i < repititions; i++) {
          r.push(f(i));
        }
        return r;
      }

      var element = function() {
        return table;
      };

      var destroy = function() {
        clicker.unbind();
      };

      var setSize = function (numRows, numCols) {
        //repeat()
        size = { width: numCols, height: numRows };
        Remove.empty(tbody);
        //create a set of trs, then for each tr, insert numCols tds
        var rows = repeat(numRows, function (r) {
          return Element.fromTag('tr');
        });

        Arr.each(rows, function (row, r) {
          var cells = repeat(numCols, function (c) {
            var td = Element.fromTag('td');
            Attr.set(td, 'data-picker-row', r);
            Attr.set(td, 'data-picker-col', c);
            return td;
          });

          InsertAll.append(row, cells);
          Insert.append(tbody, row);
        });
      };

      var clicker = DomEvent.bind(table, 'mousedown', function (event) {
        var target = event.target();
        var cell = Node.name(target) === 'td' ? Option.some(target) : SelectorFind.ancestor(target, 'td');
        cell.each(function (c) {
          var col = parseInt(Attr.get(c, 'data-picker-col'), 10);
          var row = parseInt(Attr.get(c, 'data-picker-row'), 10);
          console.log('col: ', col, 'row: ', row);
          events.trigger.select(col + 1, row + 1 );
        });
      });

      var getSize = function () {

      }

      var setSelection = function(numRows, numCols) {

        //clear any previoius selection
        var allCells = SelectorFilter.descendants(tbody, 'td');
        Arr.each(allCells, function(cell) {
          Class.remove(cell, Styles.resolve('picker-selected'));
        });


        var rows = SelectorFilter.descendants(tbody, 'tr').slice(0,numRows);
        Arr.each(rows, function(row) {
          var cells = SelectorFilter.descendants(row, 'td').slice(0,numCols);
          Arr.each(cells, function(cell) {
            Class.add(cell, Styles.resolve('picker-selected'));
          });
        });
      };

      var active = false;

      var on = function () {
        active = true;
      };

      var off = function () {
        active = false;
      };

      var handler = function (event) {
        if (active) {
          var width = Width.get(table);
          var height = Height.get(table);
          var position = Location.absolute(table);
          var cell = CellPosition.getPosition({x: position.left(), y: position.top()}, {width: width, height: height}, size.width, size.height, { x: event.x(), y: event.y() });
          var newSize = { col: cell.col + 1, row: cell.row + 1};
          //validate the size
          var selection = ensureSize(newSize);
          var tableSize = ensureSize({ col: selection.col + 1, row: selection.row + 1});

          if (tableSize.row !== size.height || tableSize.col !== size.width) {
            setSize(tableSize.row, tableSize.col);
            size = { width: tableSize.col, height: tableSize.row };
            events.trigger.resize();
          }
          
          setSelection(selection.row, selection.col); 
        }
      }

      var ensureSize = function (cell) {
        var col = Math.max(MIN_COLS, Math.min(MAX_COLS, cell.col));
        var row =  Math.max(MIN_ROWS, Math.min(MAX_ROWS, cell.row));
        return {col: col, row: row};
      }

      var go = function () {
        var hack = DomEvent.bind(Element.fromDom(document), 'mousemove', handler);
      };

      return {
        element: element,
        destroy: destroy,
        setSize: setSize,
        setSelection: setSelection,
        go: go,
        on: on,
        off: off,
        events: events.registry
      };
    }
  }
);