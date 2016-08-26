define(
  'ephox.alloy.keying.FlatgridType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.alloy.navigation.DomPinpoint',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.alloy.navigation.Navigator',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, SystemEvents, EventHandler, ArrNavigation, DomPinpoint, KeyMatch, KeyRules, Navigator, FieldSchema, Objects, Fun, Option, Cell, Focus, SelectorFind) {
    // FIX: Dupe with FlowType.
    var defaultExecute = function (component, simulatedEvent, focused) {
      var system = component.getSystem();
      system.triggerEvent(SystemEvents.execute(), focused, simulatedEvent);
    };

    var schema = function () {
      return [
        FieldSchema.strict('selector'),
        FieldSchema.defaulted('execute', defaultExecute),
        FieldSchema.state('dimensions', function () {
          return Cell({
            numColumns: 0,
            numRows: 0
          });
        }),
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

    var execute = function (component, simulatedEvent, gridInfo) {
      Focus.search(component.element(), gridInfo.selector()).each(function (focused) {
        gridInfo.execute()(component, simulatedEvent, focused);
        simulatedEvent.stop();
      });
    };

    var move = function (navigator) {
      return function (component, simulatedEvent, gridInfo) {
        var container = component.element();
        var delta = navigator(container);
        return Focus.search(container).bind(function (focused) {
          return DomPinpoint.locateVisible(container, focused, gridInfo.selector()).bind(function (identified) {
            var outcome = ArrNavigation.cycleGrid(
              identified.candidates(),
              identified.index(),
              gridInfo.dimensions().get().numRows,
              gridInfo.dimensions().get().numColumns,
              delta.x(),
              delta.y(),
              Fun.constant(true)
            );

            var newCell = outcome.bind(function (newIndex) {
              var cells = identified.candidates();
              return newIndex >= 0 && newIndex < cells.length ? Option.some(cells[newIndex]) : Option.none();
            });

            newCell.each(function (newFocus) {
              component.getSystem().triggerFocus(newFocus, component.element());
              simulatedEvent.stop();
            });
          });
        });          
      };
    };

    var rules = [
      KeyRules.rule( KeyMatch.inSet( Keys.LEFT().concat(Keys.UP()) ), move(Navigator.west)),
      KeyRules.rule( KeyMatch.inSet( Keys.RIGHT().concat(Keys.DOWN()) ), move(Navigator.east)),
      KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
    ];

    var processKey = function (component, simulatedEvent, gridInfo) {
      KeyRules.choose(rules, simulatedEvent.event()).each(function (transition) {
        transition(component, simulatedEvent, gridInfo);
      });
    };

    var toEvents = function (gridInfo) {
      return Objects.wrapAll([
        { 
          key: SystemEvents.focus(),
          value: EventHandler.nu({
            run: function (component) {
              // TODO: Do we want to implement a 'recent' again?
              // Find a target inside the component
              focusIn(component, gridInfo);
            }
          })
        },
        {
          key: 'keydown',
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              return processKey(component, simulatedEvent, gridInfo);
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