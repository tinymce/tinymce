define(
  'ephox.alloy.keying.KeyingType',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger'
  ],

  function (SystemEvents, EventHandler, KeyRules, FieldSchema, Objects, Merger) {
    var typical = function (infoSchema, getRules, getEvents, getApis, optFocusIn) {
      var schema = function () {
        return infoSchema.concat([
          FieldSchema.state('handler', function () {
            return self;
          })
        ]);
      };
   
      var processKey = function (component, simulatedEvent, escapeInfo) {
        var rules = getRules(component, simulatedEvent, escapeInfo);

        return KeyRules.choose(rules, simulatedEvent.event()).bind(function (rule) {
          return rule(component, simulatedEvent, escapeInfo);
        });
      };

      var toEvents = function (keyInfo) {
        var otherEvents = getEvents(keyInfo);
        var keyEvents = Objects.wrapAll(
          optFocusIn.map(function (focusIn) {
            return { 
              key: SystemEvents.focus(),
              value: EventHandler.nu({
                run: function (component) {
                  focusIn(component, keyInfo);
                }
              })
            };
          }).toArray().concat([
            {
              key: 'keydown',
              value: EventHandler.nu({
                run: function (component, simulatedEvent) {
                  processKey(component, simulatedEvent, keyInfo).each(function (_) {
                    simulatedEvent.stop();
                  });
                }
              })
            }
          ]
        ));
        return Merger.deepMerge(otherEvents, keyEvents);
      };

       var self = {
        schema: schema,
        processKey: processKey,
        toEvents: toEvents,
        toApis: getApis
      };

      return self;
    };

    return {
      typical: typical
    };
  }
);