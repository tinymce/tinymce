define(
  'ephox.alloy.menu.grid.GridView',

  [
    'ephox.alloy.menu.grid.GridSandbox',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (GridSandbox, MenuMarkers, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var schema = [
      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('grid'),
          FieldSchema.strict('item')
        ])
      ),

      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.itemSchema()
      ),


      FieldSchema.defaulted('flat', false),
      FieldSchema.state('sandbox', function () {

        var spawn = function (button, detail, interactions) {
          return GridSandbox.make({
            uid: detail.uid() + '-sandbox',
            lazyHotspot: Fun.constant(button),
            sink: interactions.sink,
            onOpen: interactions.onOpen,
            onClose: interactions.onClose,
            onExecute: interactions.onExecute,
            flat: detail.view().flat(),
            members: {
              item: detail.view().members().item(),
              grid: detail.view().members().grid()
            },
            markers: {
              item: detail.view().markers().item(),
              selectedItem: detail.view().markers().selectedItem()
            }
          });
        };

        return {
          spawn: spawn
        };
      })
    ];

    return schema;

  }
);