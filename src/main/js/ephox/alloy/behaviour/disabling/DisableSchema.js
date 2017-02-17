define(
  'ephox.alloy.behaviour.disabling.DisableSchema',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    return [
      FieldSchema.defaulted('disabled', false),
      FieldSchema.option('disableClass')
    ];
  }
);