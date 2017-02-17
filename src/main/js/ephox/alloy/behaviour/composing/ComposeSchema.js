define(
  'ephox.alloy.behaviour.composing.ComposeSchema',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    return [
      FieldSchema.strict('find')
    ];
  }
);