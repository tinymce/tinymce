define(
  'ephox.alloy.keying.EscapingType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun'
  ],

  function (Keys, EventHandler, KeyMatch, KeyRules, FieldSchema, Objects, Fun) {
    // DUPE
    var schema = function () {
      return [
        FieldSchema.strict('onEscape'),
        FieldSchema.state('handler', function () {
          return self;
        })
      ];
    };

    var doEscape = function (component, simulatedEvent, escapeInfo) {
      return escapeInfo.onEscape()(component, simulatedEvent);
    };
    
    var processKey = function (component, simulatedEvent, escapeInfo) {
      var transitions = [
        KeyRules.rule( KeyMatch.inSet(Keys.ESCAPE()), doEscape)
      ];

      return KeyRules.choose(transitions, simulatedEvent.event()).bind(function (transition) {
        return transition(component, simulatedEvent, escapeInfo);
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