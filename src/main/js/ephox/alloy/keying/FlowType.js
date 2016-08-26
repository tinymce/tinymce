define(
  'ephox.alloy.keying.FlowType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.navigation.DomNavigation',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.alloy.navigation.Navigator',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, SystemEvents, EventHandler, DomNavigation, KeyMatch, KeyRules, Navigator, FieldSchema, Objects, Fun, Focus, SelectorFind) {
    var schema = function () {
      return [
        FieldSchema.strict('selector'),
        FieldSchema.defaulted('execute', defaultExecute),
        FieldSchema.state('handler', function () {
          return self;
        })
      ];
    };

    var move = function (navigator) {
      return function (component, simulatedEvent, flowInfo) {
        var delta = navigator(component.element());
        var outcome = Focus.search(component.element(), flowInfo.selector()).bind(function (focused) {
          return DomNavigation.horizontal(component.element(), flowInfo.selector(), focused, delta.x());
        });

        outcome.each(function (newFocus) {
          component.getSystem().triggerFocus(newFocus, component.element());
          simulatedEvent.stop();
        });
      };
    };

    var defaultExecute = function (component, simulatedEvent, focused) {
      var system = component.getSystem();
      system.triggerEvent(SystemEvents.execute(), focused, simulatedEvent);
    };

    var execute = function (component, simulatedEvent, flowInfo) {
      Focus.search(component.element(), flowInfo.selector()).each(function (focused) {
        flowInfo.execute()(component, simulatedEvent, focused);
        simulatedEvent.stop();
      });
    };

    var focusIn = function (component, flowInfo) {
      SelectorFind.descendant(component.element(), flowInfo.selector()).each(function (first) {
        component.getSystem().triggerFocus(first, component.element());
      });
    };

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
      toEvents: toEvents,
      toApis: Fun.constant({ })
    };

    return self;
  }
);