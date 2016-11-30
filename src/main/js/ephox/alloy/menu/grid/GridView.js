define(
  'ephox.alloy.menu.grid.GridView',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.grid.GridSandbox',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Fields, GridSandbox, MenuMarkers, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var schema = [
      Fields.members([ 'grid', 'item' ]),

      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.itemSchema()
      ),

      Fields.initSize(),

      FieldSchema.defaulted('preprocess', Fun.identity),

      FieldSchema.defaulted('flat', false),
      FieldSchema.state('sandbox', function () {

        var spawn = function (lazyAnchor, detail, interactions) {
          return GridSandbox.make({
            uid: detail.uid() + '-sandbox',
            lazyAnchor: lazyAnchor,
            lazySink: interactions.lazySink,
            onOpen: interactions.onOpen,
            onClose: interactions.onClose,
            onExecute: interactions.onExecute,
            flat: detail.view().flat(),
            members: {
              item: detail.view().members().item(),
              grid: detail.view().members().grid()
            },
            initSize: {
              numColumns: detail.view().initSize().numColumns(),
              numRows: detail.view().initSize().numRows()
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