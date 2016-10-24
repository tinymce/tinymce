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
          FieldSchema.strict('container'),
          FieldSchema.strict('widget')
        ])
      ),

      FieldSchema.state('sandbox', function () {

        var spawn = function (button, detail, interactions) {
          return WidgetSandbox.make({
            uid: detail.uid() + '-sandbox',
            lazyHotspot: Fun.constant(button),
            sink: interactions.sink,
            onOpen: interactions.onOpen,
            onClose: interactions.onClose,
            onExecute: interactions.onExecute,
            members: {
              container: detail.view().members().container(),
              widget: detail.view().members().widget()
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