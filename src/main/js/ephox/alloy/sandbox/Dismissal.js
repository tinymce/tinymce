define(
  'ephox.alloy.sandbox.Dismissal',

  [
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Sandboxing, FieldSchema, ValueSchema, Fun) {
    var schema = ValueSchema.objOf([
      FieldSchema.defaulted('isExtraPart', Fun.constant(false))
    ]);

    var receiving = function (rawSpec) {
      var spec = ValueSchema.asRawOrDie('Dismissal', schema, rawSpec);
      return {
        channels: {
          'dismiss.popups': {
            schema: ValueSchema.objOf([
              FieldSchema.strict('target')
            ]),
            onReceive: function (sandbox, data) {
              if (Sandboxing.isShowing(sandbox)) {
                var isPart = Sandboxing.isPartOf(sandbox, data.target()) || spec.isExtraPart(sandbox, data.target());
                if (! isPart) Sandboxing.closeSandbox(sandbox);
              }
            }
          }
        }
      };
    };

    return {
      receiving: receiving
    };
  }
);