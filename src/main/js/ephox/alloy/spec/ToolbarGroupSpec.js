define(
  'ephox.alloy.spec.ToolbarGroupSpec',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.data.Fields',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (Behaviour, Fields, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('items'),

      Fields.members([ 'item' ]),

      FieldSchema.defaulted('hasTabstop', true),


      FieldSchema.strictObjOf('markers', [
        FieldSchema.strict('itemClass')
      ])
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
              return detail.members().item().munge(item);
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
        tabstopping: detail.hasTabstop() ? true : undefined,
        focusing: undefined,

        behaviours: [
          Behaviour.exhibition(Option.none(), {
            attributes: {
              role: 'toolbar'
            }
          })
        ]
      };
    };

    return {
      make: make
    };
  }
);