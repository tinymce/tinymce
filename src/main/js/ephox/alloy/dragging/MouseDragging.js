define(
  'ephox.alloy.dragging.MouseDragging',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    var instance = function () {
      var handlers = function (info) {

      };

      return {
        handlers: handlers
      };
    };

    var schema = [
      FieldSchema.defaulted('useFixed', false),
      FieldSchema.state('dragger', instance)
    ];

    return schema;
  }
);