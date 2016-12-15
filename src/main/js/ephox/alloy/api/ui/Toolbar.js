define(
  'ephox.alloy.api.ui.Toolbar',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (BehaviourExport, Replacing, ToolbarGroup, UiBuilder, Fields, PartType, FieldSchema, Arr, Merger, Fun, Result) {
    var schema = [
      FieldSchema.defaulted('shell', true),
      Fields.members([ 'group' ])
    ];

    var enhanceGroups = function (detail) {
      return {
        behaviours: {
          replacing: { }
        }
      };
    };

    var partTypes = [
      PartType.optional({ build: Fun.identity }, 'groups', '<alloy.toolbar.groups>', Fun.constant({ }), enhanceGroups)
    ];

    var make = function (detail, components, spec, _externals) {

      var setGroups = function (toolbar, groups) {
        getGroupContainer(toolbar).each(function (container) {
          container.logSpec();
          Replacing.set(container, groups);
        });
      };

      var getGroupContainer = function (component) {
        return detail.shell() ? Result.value(component) : component.getSystem().getByUid(
          detail.partUids().groups
        );
      };

      var createGroups = function (toolbar, gspecs) {
        return Arr.map(gspecs, function (grp) {
          return ToolbarGroup.build(
            Merger.deepMerge(
              detail.members().group().munge(grp)
            )
          );
        });
      };

      var extra = (function () {
        if (detail.shell()) {
          return {
            base: Merger.deepMerge(detail.parts().groups(), enhanceGroups(detail)),
            comps: [ ]
          };
        } else {
          return {
            base: { },
            comps: components
          };
        }
      })();

      console.log('extra', extra);

      return Merger.deepMerge(
        extra.base,
        {
          dom: {
            attributes: {
              role: 'group'
            }
          }
        },
        {
          uiType: 'custom',
          uid: detail.uid(),
          dom: detail.dom(),
          components: extra.comps,

          apis: {
            createGroups: createGroups,
            setGroups: setGroups
          }
        }
      );
    };


    var build = function (spec) {
      return UiBuilder.composite('toolbar', schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('toolbar', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts),

      createGroups: function (toolbar, gspecs) {
        var spi = toolbar.config(BehaviourExport.spi());
        return spi.createGroups(toolbar, gspecs);
      },

      setGroups: function (toolbar, gspecs) {
        var spi = toolbar.config(BehaviourExport.spi());
        return spi.setGroups(toolbar, gspecs);
      }
    };
  }
);