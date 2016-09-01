define(
  'ephox.alloy.keying.MenuType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomNavigation',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, SystemEvents, EventHandler, DomMovement, DomNavigation, KeyMatch, KeyRules, FieldSchema, Objects, Fun, Focus, SelectorFind) {
    // FIX: Dupe with Flowtype
    var schema = function () {
      return [
        FieldSchema.strict('selector'),
        FieldSchema.defaulted('execute', defaultExecute),
        FieldSchema.option('onRight'),
        FieldSchema.option('onLeft'),
        FieldSchema.option('onEscape'),
        FieldSchema.option('onTab'),
        FieldSchema.option('onShiftTab'),
        FieldSchema.state('handler', function () {
          return self;
        })
      ];
    };

    // INVESTIGATE: nice way of sharing defaultExecute
    var defaultExecute = function (component, simulatedEvent, focused) {
      var system = component.getSystem();
      system.triggerEvent(SystemEvents.execute(), focused, simulatedEvent);
    };

    var execute = function (component, simulatedEvent, menuInfo) {
      return Focus.search(component.element()).each(function (focused) {
        menuInfo.execute()(component, simulatedEvent, focused);
        return true;
      });
    };

    var focusIn = function (component, menuInfo) {
      SelectorFind.descendant(component.element(), menuInfo.selector()).each(function (first) {
        component.getSystem().triggerFocus(first, component.element());
      });
    };

    var moveUp = function (element, focused, info) {
      return DomNavigation.horizontal(element, info.selector(), focused, -1);
    };

    var moveDown = function (element, focused, info) {
      return DomNavigation.horizontal(element, info.selector(), focused, +1);
    };

    var fire = function (onHandler) {
      return function (component, simulatedEvent, menuInfo) {
        return menuInfo[onHandler]().bind(function (h) {
          return h(component, simulatedEvent.event().target());
        });
      };
    };

    var rules = [
      KeyRules.rule( KeyMatch.inSet( Keys.UP() ), DomMovement.move(moveUp)),
      KeyRules.rule( KeyMatch.inSet( Keys.DOWN() ), DomMovement.move(moveDown)),
      KeyRules.rule( KeyMatch.inSet( Keys.RIGHT() ), fire('onRight')),
      KeyRules.rule( KeyMatch.inSet( Keys.LEFT() ), fire('onLeft')),
      KeyRules.rule( KeyMatch.inSet( Keys.ESCAPE() ), fire('onEscape')),
      KeyRules.rule( KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), fire('onShiftTab')),
      KeyRules.rule( KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet( Keys.TAB()) ]), fire('onTab')),
      KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
    ];

    var processKey = function (component, simulatedEvent, menuInfo) {
      return KeyRules.choose(rules, simulatedEvent.event()).bind(function (transition) {
        return transition(component, simulatedEvent, menuInfo);
      });
    };

    var toEvents = function (menuInfo) {
      return Objects.wrapAll([
        { 
          key: SystemEvents.focus(),
          value: EventHandler.nu({
            run: function (component) {
              // Find a target inside the component
              focusIn(component, menuInfo);
            }
          })
        },
        {
          key: 'keydown',
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              processKey(component, simulatedEvent, menuInfo).each(function (_) {
                simulatedEvent.stop();
              });
            }
          })
        }
      ]);
    };

    var self = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents,
      toApis: Fun.constant({ })
    };

    return self;
  }
);