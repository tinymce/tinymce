define(
  'ephox.alloy.keying.FlatgridType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomPinpoint',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, SystemEvents, EventHandler, ArrNavigation, DomMovement, DomPinpoint, KeyMatch, KeyRules, FieldSchema, Objects, Cell, Focus, SelectorFind) {
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
            numColumns: 1,
            numRows: 1
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

    var doMove = function (cycle) {
      return function (element, focused, info) {
        return DomPinpoint.locateVisible(element, focused, info.selector()).bind(function (identified) {
          return cycle(
            identified.candidates(),
            identified.index(),
            info.dimensions().get().numRows,
            info.dimensions().get().numColumns
          );
        });
      };
    };

    var moveLeft = doMove(ArrNavigation.cycleLeft);
    var moveRight = doMove(ArrNavigation.cycleRight);
    
    var moveNorth = doMove(ArrNavigation.cycleUp);
    var moveSouth = doMove(ArrNavigation.cycleDown);

    var rules = [
      KeyRules.rule( KeyMatch.inSet( Keys.LEFT() ), DomMovement.west(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.RIGHT() ), DomMovement.east(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.UP() ), DomMovement.north(moveNorth)),
      KeyRules.rule( KeyMatch.inSet( Keys.DOWN() ), DomMovement.south(moveSouth)),
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

    var setGridSize = function (gridInfo, numRows, numColumns) {
      gridInfo.dimensions().set({
        numRows: numRows,
        numColumns: numColumns
      });
    };

    var toApis = function (gridInfo) {
      return {
        setGridSize: function (component, numRows, numCols) {
          setGridSize(gridInfo, numRows, numCols);
        }
      };
    };

    var self = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents,
      toApis: toApis
    };

    return self;
  }
);