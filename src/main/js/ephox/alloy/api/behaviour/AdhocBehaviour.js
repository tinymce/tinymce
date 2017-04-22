define(
  'ephox.alloy.api.behaviour.AdhocBehaviour',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, FieldSchema, Fun) {
    var events = function (name, eventHandlers) {
      return Behaviour.create([
        FieldSchema.strict('enabled')
      ], name, {
        events: Fun.constant(eventHandlers)
      
      }, { }, { });
    };

    var config = function (name) {
      return {
        key: name,
        value: { enabled: true }
      }
    };

    return {
      events: events,
      config: config
    };
  }
);