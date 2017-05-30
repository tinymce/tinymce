define(
  'ephox.alloy.api.behaviour.AddEventsBehaviour',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, AlloyEvents, FieldSchema, Fun) {
    var events = function (name, eventHandlers) {
      var events = AlloyEvents.derive(eventHandlers);

      return Behaviour.create({
        fields: [
          FieldSchema.strict('enabled')
        ],
        name: name,
        active: {
          events: Fun.constant(events)
        }
      });
    };

    var config = function (name, eventHandlers) {
      var me = events(name, eventHandlers);

      return {
        key: name,
        value: {
          config: { },
          me: me,
          configAsRaw: Fun.constant({ }),
          initialConfig: { },
          state: Behaviour.noState()
        }
      };
    };

    return {
      events: events,
      config: config
    };
  }
);