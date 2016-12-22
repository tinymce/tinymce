define(
  'ephox.alloy.behaviour.dragndrop.DragStarting',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema'
  ],

  function (DomModification, FieldSchema) {
    return [
      FieldSchema.strict('type'),
      FieldSchema.state('instance', function () {

        var exhibit = function () {
          return DomModification.nu({
            attributes: {
              draggable: 'true'
            }
          });
        };

        var handlers = function (dragInfo) {
          return {
            'dragstart': function () {
              debugger
            }
          };
        };

        return {
          exhibit: exhibit,
          handlers: handlers
        };
      })
    ];
  }
);