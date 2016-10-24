define(
  'ephox.alloy.menu.layered.LayeredView',

  [
    'ephox.alloy.menu.layered.LayeredSandbox',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (LayeredSandbox, FieldPresence, FieldSchema, ValueSchema, Fun) {
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
        ValueSchema.objOf([
          FieldSchema.strict('menu'),
          FieldSchema.strict('item')
        ])
      ),

      FieldSchema.state('sandbox', function () {

        var spawn = function (button, detail, blah) {
          return LayeredSandbox.make({
            uid: detail.uid + '-sandbox',
            lazyHotspot: Fun.constant(button),
            
            sink: blah.sink,
            onOpen: blah.onOpen,
            onClose: blah.onClose,
            onExecute: blah.onExecute,

            flat: detail.view.flat,
            members: detail.view.members,
            markers: detail.view.markers
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