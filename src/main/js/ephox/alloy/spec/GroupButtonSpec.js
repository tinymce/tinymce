define(
  'ephox.alloy.spec.GroupButtonSpec',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger'
  ],

  function (FieldPresence, FieldSchema, ValueSchema, Arr, Merger) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('action'),
      FieldSchema.strict('buttonTypes'),
      FieldSchema.strict('toggleClass'),
      FieldSchema.field(
        'buttons',
        'buttons',
        FieldPresence.strict(),
        ValueSchema.arrOf(
          ValueSchema.objOf([
            FieldSchema.strict('value'),
            FieldSchema.strict('spec'),
            FieldSchema.option('extra')
          ])
        )
      ),
      FieldSchema.option('uid')
    ]);


    var make = function (spec) {
      // Not sure about where these getOrDie statements are
      var detail = ValueSchema.asStructOrDie('gropubutton.spec', schema, spec);

      return Merger.deepMerge(spec, {
        type: 'custom',
        dom: {
          tag: 'div',
          styles: {
            display: 'flex'
          },
          classes: [ 'ephox-alloy-toolbar-item' ]
        },
        components: Arr.map(detail.buttons(), function (buttonSpec) {
          return Merger.deepMerge(
            {
              uiType: 'button',
              buttonType: buttonSpec.spec(),
              toggling: {
                toggleClass: detail.toggleClass()
              }
            }, {
              buttonType: {
                mode: detail.buttonTypes()
              }
            }, {
              action: function () { }
            }, buttonSpec.extra().getOr({ })
          );
        })
      });
    };

    return {
      make: make
    };
  }
);