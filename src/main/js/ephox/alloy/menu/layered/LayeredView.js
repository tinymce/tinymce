define(
  'ephox.alloy.menu.layered.LayeredView',

  [
    'ephox.alloy.menu.layered.LayeredSandbox',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (LayeredSandbox, MenuMarkers, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var schema = [
      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('menu'),
          FieldSchema.strict('item')
        ])
      ),

      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.schema()
      ),

      FieldSchema.strict('scaffold'),

      FieldSchema.defaulted('preprocess', Fun.identity),
      FieldSchema.defaulted('fakeFocus', false),
      FieldSchema.defaulted('onHighlight', Fun.noop),

      FieldSchema.state('sandbox', function () {

        var spawn = function (lazyAnchor, detail, interactions) {
          return LayeredSandbox.make({
            uid: detail.uid() + '-sandbox',
            lazyAnchor: lazyAnchor,
            
            lazySink: interactions.lazySink,
            onOpen: interactions.onOpen,
            onClose: interactions.onClose,
            onExecute: interactions.onExecute,
            onHighlight: detail.view().onHighlight(),

            fakeFocus: detail.view().fakeFocus(),
            scaffold: detail.view().scaffold(),

            members: {
              item: detail.view().members().item(),
              menu: detail.view().members().menu()
            },
            markers: {
              item: detail.view().markers().item(),
              selectedItem: detail.view().markers().selectedItem(),
              menu: detail.view().markers().menu(),
              selectedMenu: detail.view().markers().selectedMenu()
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