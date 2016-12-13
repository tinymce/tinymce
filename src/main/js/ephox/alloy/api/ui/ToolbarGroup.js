define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (PartType, Tagger, SpecSchema, FieldSchema, Merger, Fun) {
    var schema = [
      FieldSchema.defaulted('shell')
    ];

    var partTypes = [
      PartType.optional({ build: Fun.identity }, 'items', '<alloy.toolbar-group.items>', Fun.constant({ }), function (detail) {
        return {
          behaviours: {
            replacing: { }
          }
        };
      })
    ];

    var make = function (detail, spec) {
      // TODO: make shell work.
      // return detail.shell() ? Merger.deepMerge(

      // );
      return {
        uiType: 'custom',
        uid: detail.uid(),
        dom: detail.dom(),
        components: [ ]
      };
    };

    var build = function (spec) {
      var rawUiSpec = Merger.deepMerge({ uid: Tagger.generate('') }, spec);
      var uiSpec = SpecSchema.asStructOrDie('Menu', schema, rawUiSpec, [ ]);
      return make(uiSpec, rawUiSpec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('toolbar-group', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);