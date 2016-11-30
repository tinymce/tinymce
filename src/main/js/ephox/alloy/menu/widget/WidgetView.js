define(
  'ephox.alloy.menu.widget.WidgetView',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.widget.WidgetSandbox',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Fields, WidgetSandbox, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var schema = [
      Fields.members([ 'container' ]),

      FieldSchema.strict('scaffold'),

      FieldSchema.defaulted('preprocess', Fun.identity),

      FieldSchema.state('sandbox', function () {

        var spawn = function (lazyAnchor, detail, interactions) {
          return WidgetSandbox.make({
            uid: detail.uid() + '-sandbox',
            lazyAnchor: lazyAnchor,
            lazySink: interactions.lazySink,
            scaffold: detail.view().scaffold(),
            onOpen: interactions.onOpen,

            onClose: interactions.onClose,
            onExecute: interactions.onExecute,
            members: {
              container: detail.view().members().container()
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