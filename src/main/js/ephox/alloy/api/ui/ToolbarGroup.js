define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'global!Error'
  ],

  function (PartType, Tagger, SpecSchema, UiSubstitutes, FieldSchema, Objects, Merger, Fun, Option, Error) {
    var schema = [
      FieldSchema.defaulted('shell', false)
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
      var components = detail.shell() ? [ ] : (function () {
        return PartType.components('toolbar-group', detail, partTypes);
      })();
      // TODO: make shell work.
      // return detail.shell() ? Merger.deepMerge(

      // );
      return {
        uiType: 'custom',
        uid: detail.uid(),
        dom: detail.dom(),
        components: components
      };
    };

    var build = function (spec) {
      var rawUiSpec = Merger.deepMerge({ uid: Tagger.generate('') }, spec);
      var uiSpec = SpecSchema.asStructOrDie('Menu', schema, rawUiSpec, [ 'items' ]);
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