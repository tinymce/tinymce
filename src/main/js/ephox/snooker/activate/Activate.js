define(
  'ephox.snooker.activate.Activate',

  [
    'ephox.compass.Arr',
    'ephox.dragster.api.Dragger',
    'ephox.snooker.activate.ColumnMutation',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Dragger, ColumnMutation, Attr, Class, Css, DomEvent, Element, Insert, Remove, SelectorExists, SelectorFilter, SelectorFind) {
    var activate = function (table) {
      var mutation = ColumnMutation();
      var dragger = Dragger.transform(mutation, {});

      mutation.events.drag.bind(function (event) {
        console.log('Dragging column', event.target().dom());
      });

      // Global me.
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
            Attr.set(mogel, 'data-ephox-snooker-column', id);
            Class.add(mogel, id);

            Insert.after(cell, mogel);
          });
        });
      };

      var plain = function () {
        dragger.off();
        var cells = SelectorFilter.descendants(table, '.mogel');
        // TODO: Remove the column heading classes.
        Arr.each(cells, Remove.remove);
      };

      return {
        glossy: glossy,
        plain: plain
      };
    };

    return {
      activate: activate
    };
  }
);
