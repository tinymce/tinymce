define(
  'ephox.alloy.behaviour.dragndrop.Dropping',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema'
  ],

  function (EventHandler, DomModification, FieldSchema) {
    return [
      FieldSchema.strict('type'),
      FieldSchema.state('instance', function () {
        // http://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html
        // For the drop event to fire at all, you have to cancel the defaults of both the dragover and the dragenter event.

        var exhibit = function () {
          return DomModification.nu({});
        };

        var handlers = function (dragInfo) {
          return {
            'dragover': EventHandler.nu({
              run: function (component, simulatedEvent) {
                // debugger;
                simulatedEvent.stop();
              }
            }),

            'dragenter': EventHandler.nu({
              run: function (component, simulatedEvent) {
                // debugger;
                simulatedEvent.stop();
              }
            }),

            'drop': EventHandler.nu({
              run: function (component, simulatedEvent) {
                document.querySelector('h2').innerHTML='Dropped';
              }
            })
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