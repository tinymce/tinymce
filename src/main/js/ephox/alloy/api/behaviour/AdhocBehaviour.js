define(
  'ephox.alloy.api.behaviour.AdhocBehaviour',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, FieldSchema, Fun) {
    var events = function (name, eventHandlers) {
      return Behaviour.create({
        fields: [
          FieldSchema.strict('enabled')
        ],
        name: name,
        active: {
          events: Fun.constant(eventHandlers)
        }
      });
    };

    var config = function (name) {
      return {
        key: name,
        value: {
          config: { },
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