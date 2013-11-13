define(
  'ephox.snooker.activate.Activate',

  [
    'ephox.compass.Arr',
    'ephox.dragster.api.Dragger',
    'ephox.snooker.activate.ColumnMutation',
    'ephox.snooker.activate.Water',
    'ephox.snooker.adjust.Dimensions',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Dragger, ColumnMutation, Water, Dimensions, Attr, Class, Css, DomEvent, Element, Insert, Remove, SelectorExists, SelectorFilter, SelectorFind, Traverse, Width) {
    var activate = function (table) {
      var mutation = ColumnMutation();
      var dragger = Dragger.transform(mutation, {});

      var getCells = function () {
        var cells = SelectorFind.descendant(table, 'tr').map(function (tr) {
          return SelectorFilter.descendants(tr, 'td');
        }).getOr([]);

        return Arr.filter(cells, function (c) {
          return !Class.has(c, 'mogel');
        });
      };

      var distribute = function () {
        var cells = getCells();
        var totalWidth = Width.get(table);
        
      };

      var refresh = function () {
        resize(0, 0);
      };

      var resize = function (col, delta) {
        var column = col ? parseInt(col) : 0;
        var step = delta ? parseInt(delta) : 0;
        var cells = getCells();

        var widths = Arr.map(cells, Dimensions.getWidth);
        var water = Water.water(widths, column, step, 10);
        console.log('adjustments: ', water);
        Arr.map(cells, function (r, i) {
          console.log('adjusting: ', r.dom(), water[i]);
          Dimensions.addWidth(r, water[i]);
          // Width.set(r, water[i]);
        });

        var total = Arr.foldr(water, function (b, a) { return b + a; }, 0);
        Dimensions.addWidth(table, total);
      };

      window.Width = Width;
      window.Dimensions = Dimensions;

      mutation.events.drag.bind(function (event) {
        var cells = SelectorFind.ancestor(event.target(), 'tr').map(Traverse.children).getOr([]);
        var real = Arr.filter(cells, function (c) {
          return !Class.has(c, 'mogel');
        });

        var column = Attr.get(event.target(), 'data-column-id');
        resize(column, event.xDelta());
        // Dimensions.adjust(event.target(), event.xDelta(), 0);
      });

      // TODO: Global modulator document.
      var resizer = DomEvent.bind(Element.fromDom(document), 'mousedown', function (event) {
        if (Class.has(event.target(), 'mogel')) {
          var body = Element.fromDom(document.body);

          var attr = Attr.get(event.target(), 'data-ephox-snooker-column');
          var cell = SelectorFind.descendant(table, '.' + attr);
          cell.each(function (c) {
            mutation.assign(c);
            dragger.go(body);
          });
        }
      });

      var glossy = function () {
        dragger.on();
        Attr.set(table, 'contenteditable', false);
        if (SelectorExists.descendant(table, '.mogel')) plain(table);
        var rows = SelectorFilter.descendants(table, 'tr');
        Arr.each(rows, function (row, i) {
          var cells = SelectorFilter.children(row, 'td');

          Arr.each(cells, function (cell, j) {
            var id = 'ephox-snooker-column-' + j;
            var mogel = Element.fromTag('td');
            Class.add(mogel, 'mogel');
            Css.setAll(mogel, {
              width: '4px',
              background: i === 0 ? 'yellow' : 'none',
              cursor: 'w-resize'
            });

            Class.add(cell, id);
            Attr.set(cell, 'data-column-id', j);
            Attr.set(mogel, 'data-ephox-snooker-column', id);
            Class.add(mogel, id);

            Insert.after(cell, mogel);
          });
        });
      };

      var plain = function () {
        Attr.remove(table, 'contenteditable');
        dragger.off();
        var cells = SelectorFilter.descendants(table, '.mogel');
        // TODO: Remove the column heading classes.
        Arr.each(cells, Remove.remove);
      };

      return {
        glossy: glossy,
        plain: plain,
        resize: resize,
        distribute: distribute,
        refresh: refresh
      };
    };

    return {
      activate: activate
    };
  }
);
