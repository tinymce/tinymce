define(
  'ephox.alloy.keying.FlatgridType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, SystemEvents, EventHandler, KeyMatch, KeyRules, FieldSchema, Objects, SelectorFind) {
    var schema = function () {
      return [
        FieldSchema.strict('selector'),
        FieldSchema.defaulted('execute', defaultExecute),
        FieldSchema.state('handler', function () {
          return self;
        })
      ];
    };

    var focusIn = function (component, gridInfo) {
      SelectorFind.descendant(component.element(), gridInfo.selector()).each(function (first) {
        component.getSystem().triggerFocus(first, component.element());
      });
    };

    var toCell = function (r, c, dx) {
        var cells = SelectorFilter.descendants(container, selector);
        var end = cells.length - 1;
        var row = (r * columns);
        /* from (last row, first cell), (last row, last cell) & (second last row, last cell) */
        var index = (row + c) > end ? ((dx > 0) ? row : end) : row + c;
        return index >= 0 && index < cells.length ? Option.some(cells[index]) : Option.none();
      };

      var fromCell = function (cell) {
        return Traverse.findIndex(cell).map(function (index) {
          return address(Math.floor(index / columns), index % columns);
        });
      };

      var resize = function (newRows, newColumns) {
        rows = newRows;
        columns = newColumns;
      };

      var move = function (deltaX, deltaY) {
        return Focuser.find(container).bind(function (focused) {
          return fromCell(focused).bind(function (p) {
            var row = Cycles.adjust(p.row(), deltaY, 0, rows - 1);
            var column = Cycles.adjust(p.column(), deltaX, 0, columns - 1);
            return toCell(row, column, deltaX);
          });
        });
      };

      var moveItem = Navigator(container, function (deltaX, deltaY) {
        return move(deltaX, deltaY).bind(function (elem) {
          Focuser.set(elem);
          recent.set(Option.some(elem));
          return Option.some(true);
        });
      });

    var rules = [
      KeyRules.rule( KeyMatch.inSet( Keys.LEFT().concat(Keys.UP()) ), move(Navigator.west)),
      KeyRules.rule( KeyMatch.inSet( Keys.RIGHT().concat(Keys.DOWN()) ), move(Navigator.east)),
      KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
    ];

    var processKey = function (component, simulatedEvent, flowInfo) {
      KeyRules.choose(rules, simulatedEvent.event()).each(function (transition) {
        transition(component, simulatedEvent, flowInfo);
      });
    };

    var toEvents = function (flowInfo) {
      return Objects.wrapAll([
        { 
          key: SystemEvents.focus(),
          value: EventHandler.nu({
            run: function (component) {
              // TODO: Do we want to implement a 'recent' again?
              // Find a target inside the component
              focusIn(component, flowInfo);
            }
          })
        },
        {
          key: 'keydown',
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              return processKey(component, simulatedEvent, flowInfo);
            }
          })
        }
      ]);
    };

    var self = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents
    };

    return self;
  }
);