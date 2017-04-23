define(
  'ephox.alloy.sandbox.Dismissal',

  [
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.messages.Channels',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Receiving, Sandboxing, Channels, FieldSchema, Objects, ValueSchema, Fun) {
    var schema = ValueSchema.objOfOnly([
      FieldSchema.defaulted('isExtraPart', Fun.constant(false))
    ]);

    var receivingConfig = function (rawSpec) {
      var c = receiving(rawSpec);
      return Receiving.config(c);
    };

    var receiving = function (rawSpec) {
      var spec = ValueSchema.asRawOrDie('Dismissal', schema, rawSpec);
      return {
        channels: Objects.wrap(
          Channels.dismissPopups(),
          {
            schema: ValueSchema.objOfOnly([
              FieldSchema.strict('target')
            ]),
            onReceive: function (sandbox, data) {
              if (Sandboxing.isOpen(sandbox)) {
                var isPart = Sandboxing.isPartOf(sandbox, data.target()) || spec.isExtraPart(sandbox, data.target());
                if (! isPart) Sandboxing.close(sandbox);
              }
            }
          }
        )
      };
    };

    return {
      receiving: receiving,
      receivingConfig: receivingConfig
    };
  }
);