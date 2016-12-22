define(
  'ephox.alloy.behaviour.dragndrop.DragStarting',

  [
    'ephox.alloy.behaviour.dragndrop.DataTransfers',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Traverse'
  ],

  function (DataTransfers, EventHandler, DomModification, FieldSchema, Class, Css, Element, Html, Insert, Remove, Traverse) {
    return [
      FieldSchema.strict('type'),
      FieldSchema.strict('getData'),
      FieldSchema.option('getImage'),
      FieldSchema.option('imageParent'),
      FieldSchema.defaulted('phoneyTypes', [ ]),
      // Maybe valid this.
      FieldSchema.defaulted('dropEffect', 'copy'),
      FieldSchema.state('instance', function () {
        var ghost = Element.fromTag('div');


        // Taken from the tech preview. The idea is that it has to be visible, but the ghost's image
        // for the drag effect is repositioned so we just need to put it offscreen.
        Class.add(ghost, 'ghost');
        Css.setAll(ghost, {
          'position': 'absolute',
          'top': '-1000px',
          'max-height': '1000px',
          'max-width': '400px',
          'overflow-y': 'hidden'
        });
        document.body.appendChild(ghost.dom());


        var exhibit = function () {
          return DomModification.nu({
            attributes: {
              draggable: 'true'
            }
          });
        };


        // Inspired by the ideas here. On mousedown, spawn an iamge at pageX, pageY
        // Fire dragDrop on that image
        // remove the image in a setTimeout( 0 )
        // http://jsfiddle.net/stevendwood/akScu/21/

        var handlers = function (dragInfo) {
          return {
            'dragstart': EventHandler.nu({
              run: function (component, simulatedEvent) {
                var transfer = simulatedEvent.event().raw().dataTransfer;
                var types = [ dragInfo.type() ].concat(dragInfo.phoneyTypes());
                var data = dragInfo.getData()(component);
                console.log('data', data);

                DataTransfers.setData(transfer, types, data);
                dragInfo.getImage().each(function (f) {
                  var parent = dragInfo.imageParent().getOrThunk(function () {
                    var doc = Traverse.owner(component.element());
                    return Element.fromDom(doc.dom().body);
                  });

                  var image = f(component);
                  Remove.empty(ghost);
                  Insert.append(ghost, image.element());
                  Insert.append(parent, ghost);
                  DataTransfers.setDragImage(transfer, ghost.dom(), image.x(), image.y());
                });
                DataTransfers.setDropEffect(transfer, dragInfo.dropEffect());
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