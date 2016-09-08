define(
  'ephox.alloy.sandbox.Dismissal',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (FieldSchema, ValueSchema, Fun) {
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
              if (sandbox.apis().isShowing()) {
                var isPart = sandbox.apis().isPartOf(data.target()) || spec.isExtraPart(sandbox, data.target());
                if (! isPart) sandbox.apis().closeSandbox();
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