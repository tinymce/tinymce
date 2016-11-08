define(
  'ephox.alloy.spec.ToolbarGroupSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('items'),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('item')
        ])
      ),

      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('itemClass')
        ])
      )
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('toolbar.group.spec', schema, spec, [ ]);

      var components = UiSubstitutes.substitutePlaces(
        Option.some('toolbar-group'),
        detail,
        detail.components(),
        {
          '<alloy.toolbar.group.items>': UiSubstitutes.multiple(
            Arr.map(detail.items(), function (item) {
              return Merger.deepMerge(
                detail.members().item().munge(item),
                {
                  dom: {
                    attributes: {
                      role: 'toolbar'
                    }
                  }
                }
              );
            })
          )
        }, 
        {

        }
      );

      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        components: components,
        keying: {
          mode: 'flow',
          selector: detail.markers().itemClass()
        },
        tabstopping: true,
        focusing: undefined
      };
    };

    return {
      make: make
    };
  }
);