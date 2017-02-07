define(
  'ephox.alloy.api.ui.Toolbar',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.ToolbarSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (Behaviour, Replacing, GuiTypes, ToolbarGroup, UiBuilder, Fields, PartType, ToolbarSchema, FieldSchema, Arr, Merger, Fun, Result) {
    var schema = ToolbarSchema.schema();

    // TODO: Dupe with ToolbarSchema
    var enhanceGroups = function (detail) {
      return {
        behaviours: {
          replacing: { }
        }
      };
    };

    var partTypes = ToolbarSchema.parts();

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
          return ToolbarGroup.sketch(
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


    var sketch = function (spec) {
      return UiBuilder.composite('toolbar', schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('toolbar', partTypes);

    return Merger.deepMerge(
      {
        sketch: sketch,
        parts: Fun.constant(parts)
      },

      GuiTypes.makeApis([ 'createGroups', 'setGroups' ])
    );
  }
);