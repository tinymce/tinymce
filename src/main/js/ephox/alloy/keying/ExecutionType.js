define(
  'ephox.alloy.keying.ExecutionType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Keys, SystemEvents, EventHandler, KeyMatch, KeyRules, FieldSchema, Objects, Merger, Fun, Option) {
    var schema = function () {
      return [
        FieldSchema.defaulted('execute', defaultExecute),
        FieldSchema.defaulted('useSpace', false),
        FieldSchema.defaulted('useEnter', true),
        FieldSchema.state('handler', function () {
          return self;
        })
      ];
    };

    // INVESTIGATE: nice way of sharing defaultExecute
    var defaultExecute = function (component, simulatedEvent, focused) {
      var system = component.getSystem();
      system.triggerEvent(SystemEvents.execute(), focused, Merger.deepMerge({
        target: Fun.constant(component.element())
      }, simulatedEvent));
    };


    var execute = function (component, simulatedEvent, executeInfo) {
      executeInfo.execute()(component, simulatedEvent, component.element());
      return Option.some(true);
    };
    
    var processKey = function (component, simulatedEvent, executeInfo) {
      var spaceExec = executeInfo.useSpace() ? Keys.SPACE() : [ ];
      var enterExec = executeInfo.useEnter() ? Keys.ENTER() : [ ];
      var execKeys = spaceExec.concat(enterExec);

      var transitions = [
        KeyRules.rule( KeyMatch.inSet(execKeys), execute)
      ];

      return KeyRules.choose(transitions, simulatedEvent.event()).bind(function (transition) {
        return transition(component, simulatedEvent, executeInfo);
      });
    };

    var toEvents = function (cyclicInfo) {
      return Objects.wrapAll([
        {
          key: 'keydown',
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              processKey(component, simulatedEvent, cyclicInfo).each(function (_) {
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