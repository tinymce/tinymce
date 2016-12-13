define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (Fields, PartType, Tagger, SpecSchema, UiSubstitutes, FieldSchema, Merger, Fun, Error) {
    var schema = [
      FieldSchema.strict('items'),
      FieldSchema.defaulted('shell', false),
      Fields.members([ 'item' ])
    ];

    var makeItems = function (detail) {
      return {
        behaviours: {
          replacing: { }
        }
      };
    };

    var partTypes = [
      PartType.group({ build: Fun.identity }, 'items', 'item', '<alloy.toolbar-group.items>', Fun.constant({ }), makeItems)
    ];

    var make = function (detail, spec) {
      var structure = detail.shell() ? (function () {
        // First level is the container.
        // Therefore merege all "items" part information into the base
        // Generate the components
        var ps = PartType.placeholders('toolbar-group', detail, partTypes);
        console.log('ps', ps);
        return {
          components: UiSubstitutes.singleReplace(detail, ps['<alloy.toolbar-group.items>']),
          base: Merger.deepMerge(
            detail.parts().items(),
            makeItems(detail)
          )
        };
      })() : (function () {
        var comps = PartType.components('toolbar-group', detail, partTypes);
        return {
          components: comps,
          base: { }
        };
      })();
      // TODO: make shell work.
      // return detail.shell() ? Merger.deepMerge(

      // );
      return Merger.deepMerge(structure.base, {
        uiType: 'custom',
        uid: detail.uid(),
        dom: detail.dom(),
        components: structure.components
      });
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