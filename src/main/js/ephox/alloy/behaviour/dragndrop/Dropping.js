define(
  'ephox.alloy.behaviour.dragndrop.Dropping',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    return [
      FieldSchema.defaulted('useFixed', false),
      FieldSchema.state('dragndropper', function () { })
    ];
  }
);