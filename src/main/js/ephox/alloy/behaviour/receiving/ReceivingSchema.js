define(
  'ephox.alloy.behaviour.receiving.ReceivingSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.perhaps.Result'
  ],

  function (FieldSchema, ValueSchema, Result) {
    return [
      FieldSchema.strictOf('channels', ValueSchema.setOf(
        // Allow any keys.
        Result.value,
        ValueSchema.objOf([
          FieldSchema.strict('onReceive'),
          FieldSchema.defaulted('schema', ValueSchema.anyValue())
        ])
      ))
    ];
  }
);