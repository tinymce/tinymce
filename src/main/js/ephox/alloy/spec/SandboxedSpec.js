define(
  'ephox.alloy.spec.SandboxedSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, ValueSchema, Merger, Option) {
    var schema = [
      FieldSchema.field(
        'sink',
        'sink',
        FieldPresence.strict(),
        ValueSchema.choose(
          'type',
          {
            internal: [

            ],
            external: [

            ]
          }
        )        
      ),

      FieldSchema.strict('dom'),
      FieldSchema.strict('component')
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('sandboxed.component.spec', schema, spec);

      var components = UiSubstitutes.substitutePlaces(Option.some('sandboxed-component'), detail, detail.components(), {
        'blah': UiSubstitutes.single(
          detail.component()
        )
      });

      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        components: components
      };
    };

    return {
      make: make
    };
  }
);