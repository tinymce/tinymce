define(
  'ephox.alloy.behaviour.dragndrop.DragStarting',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    return [
      FieldSchema.strict('type'),
      FieldSchema.state('instance', function () {
        var handlers = function () {
          return { };
        };

        return {
          handlers: handlers
        };
      })
    ];
  }
);