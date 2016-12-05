define(
  'ephox.alloy.behaviour.positioning.PositionSchema',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    return [
      FieldSchema.defaulted('useFixed', false),
      FieldSchema.option('bounds')
    ];
  }
);