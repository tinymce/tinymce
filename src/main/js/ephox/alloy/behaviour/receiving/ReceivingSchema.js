define(
  'ephox.alloy.behaviour.receiving.ReceivingSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Result'
  ],

  function (Fields, FieldSchema, ValueSchema, Result) {
    return [
      FieldSchema.strictOf('channels', ValueSchema.setOf(
        // Allow any keys.
        Result.value,
        ValueSchema.objOf([
          Fields.onStrictHandler('onReceive'),
          FieldSchema.defaulted('schema', ValueSchema.anyValue())
        ])
      ))
    ];
  }
);