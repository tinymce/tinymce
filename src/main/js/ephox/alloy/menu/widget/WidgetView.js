define(
  'ephox.alloy.menu.widget.WidgetView',

  [
    'ephox.alloy.menu.widget.WidgetSandbox',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (WidgetSandbox, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var schema = [
      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('container')
        ])
      ),

      FieldSchema.strict('scaffold'),

      FieldSchema.defaulted('preprocess', Fun.identity),

      FieldSchema.state('sandbox', function () {

        var spawn = function (anchor, detail, interactions) {
          return WidgetSandbox.make({
            uid: detail.uid() + '-sandbox',
            lazyAnchor: Fun.constant(anchor),
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