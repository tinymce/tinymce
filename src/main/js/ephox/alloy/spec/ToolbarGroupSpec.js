define(
  'ephox.alloy.spec.ToolbarGroupSpec',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.data.Fields',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Behaviour, Fields, SpecSchema, UiSubstitutes, FieldSchema, Arr, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('items'),
      FieldSchema.defaulted('hasTabstop', true),
      Fields.members([ 'item' ]),
      Fields.markers([ 'itemClass' ])
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