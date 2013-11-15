define(
  'ephox.snooker.picker.Picker',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.data.Structs',
    'ephox.snooker.picker.Redimension',
    'ephox.snooker.style.Styles',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function(Arr, Option, Event, Events, Structs, Redimension, Styles, Attr, Class, DomEvent, Element, Insert, InsertAll, Node, Remove, SelectorFilter, SelectorFind) {
    return function () {
      var events = Events.create({
        resize: Event([]),
        select: Event(['cols', 'rows'])
      });

      var table = Element.fromTag('table');
      Class.add(table, Styles.resolve('table-picker'));
      var tbody = Element.fromTag('tbody');
      Insert.append(table, tbody);

      var size = { width: 0, height: 0};

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
        mover.unbind();
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

      var setSelection = function(numRows, numCols) {
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

      var redimension = Redimension();
      redimension.events.resize.bind(function (event) {
        var grid = event.grid();
        console.log('grid: ', grid.row(), 'x', grid.column());
      });

      alert("hello");

      var mover = DomEvent.bind(Element.fromDom(document), 'mousemove', function (event) {
        console.log("moving");
        redimension.handle(self, Structs.grid(size.height, size.width), event.x(), event.y());
      });

      var clicker = DomEvent.bind(table, 'mousedown', function (event) {
        var target = event.target();
        var cell = Node.name(target) === 'td' ? Option.some(target) : SelectorFind.ancestor(target, 'td');
        cell.each(function (c) {
          var col = parseInt(Attr.get(c, 'data-picker-col'), 10);
          var row = parseInt(Attr.get(c, 'data-picker-row'), 10);
          events.trigger.select(col + 1, row + 1 );
        });
      });

      var self = {
        element: element,
        destroy: destroy,
        setSize: setSize,
        setSelection: setSelection,
        on: redimension.on,
        off: redimension.off,
        events: events.registry
      };

      return self;
    }
  }
);