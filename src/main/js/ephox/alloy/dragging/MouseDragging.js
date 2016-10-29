define(
  'ephox.alloy.dragging.MouseDragging',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldSchema'
  ],

  function (EventHandler, FieldSchema) {
    var instance = function () {
      var handlers = function (dragInfo) {
        return {
          'mousedown': EventHandler.nu({
            run: function (comp, simulatedEvent) {
              console.log('mouse down');
            }
          })
        };
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