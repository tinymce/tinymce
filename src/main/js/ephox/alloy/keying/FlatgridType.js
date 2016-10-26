define(
  'ephox.alloy.keying.FlatgridType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomPinpoint',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.alloy.navigation.WrapArrNavigation',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, KeyingType, KeyingTypes, DomMovement, DomPinpoint, KeyMatch, KeyRules, WrapArrNavigation, FieldPresence, FieldSchema, ValueSchema, Fun, Option, Cell, Focus, SelectorFind) {
    var schema = [
      FieldSchema.strict('selector'),
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
      FieldSchema.defaulted('onEscape', Option.none),
      FieldSchema.defaulted('captureTab', false),
      FieldSchema.field(
        'initSize',
        'initSize',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('numColumns'),
          FieldSchema.strict('numRows')
        ])
      ),
      FieldSchema.state('dimensions', function () {
        return Cell(Option.none());
      })
    ];

    var focusIn = function (component, gridInfo) {
      SelectorFind.descendant(component.element(), gridInfo.selector()).each(function (first) {
        component.getSystem().triggerFocus(first, component.element());
      });
    };

    var execute = function (component, simulatedEvent, gridInfo) {
      return Focus.search(component.element(), gridInfo.selector()).bind(function (focused) {
        return gridInfo.execute()(component, simulatedEvent, focused);
      });
    };

    var doMove = function (cycle) {
      return function (element, focused, info) {
        return DomPinpoint.locateVisible(element, focused, info.selector()).bind(function (identified) {
          return cycle(
            identified.candidates(),
            identified.index(),
            info.dimensions().get().map(function (d) { return d.numRows(); }).getOr(info.initSize().numRows()),
            info.dimensions().get().map(function (d) { return d.numColumns(); }).getOr(info.initSize().numColumns())
          );
        });
      };
    };

    var handleTab = function (component, simulatedEvent, gridInfo) {
      return gridInfo.captureTab() ? Option.some(true) : Option.none();
    };

    var doEscape = function (component, simulatedEvent, gridInfo) {
      return gridInfo.onEscape()(component, simulatedEvent);
    };

    var moveLeft = doMove(WrapArrNavigation.cycleLeft);
    var moveRight = doMove(WrapArrNavigation.cycleRight);
    
    var moveNorth = doMove(WrapArrNavigation.cycleUp);
    var moveSouth = doMove(WrapArrNavigation.cycleDown);

    var getRules = Fun.constant([
      KeyRules.rule( KeyMatch.inSet( Keys.LEFT() ), DomMovement.west(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.RIGHT() ), DomMovement.east(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.UP() ), DomMovement.north(moveNorth)),
      KeyRules.rule( KeyMatch.inSet( Keys.DOWN() ), DomMovement.south(moveSouth)),
      KeyRules.rule( KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), handleTab),
      KeyRules.rule( KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet( Keys.TAB()) ]), handleTab),
      KeyRules.rule( KeyMatch.inSet( Keys.ESCAPE() ), doEscape),

      KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
    ]);

    var getEvents = Fun.constant({ });

    var setGridSize = function (gridInfo, numRows, numColumns) {
      gridInfo.dimensions().set(
        Option.some({
          numRows: numRows,
          numColumns: numColumns
        })
      );
    };

    var getApis = function (gridInfo) {
      return {
        setGridSize: function (component, numRows, numCols) {
          setGridSize(gridInfo, numRows, numCols);
        }
      };
    };

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);