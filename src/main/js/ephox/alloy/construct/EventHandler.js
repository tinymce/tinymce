define(
  'ephox.alloy.construct.EventHandler',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (FieldPresence, FieldSchema, ValueSchema, Fun) {
    return function (parts) {
      return ValueSchema.asRaw('Extracting event.handler', ValueSchema.objOf([
        FieldSchema.field('can', 'can', FieldPresence.defaulted(Fun.constant(true)), ValueSchema.anyValue()),
        FieldSchema.field('abort', 'abort', FieldPresence.defaulted(Fun.constant(false)), ValueSchema.anyValue()),
        FieldSchema.field('run', 'run', FieldPresence.defaulted(Fun.noop), ValueSchema.anyValue())
      ]), parts).getOrDie();
    };
  }
);