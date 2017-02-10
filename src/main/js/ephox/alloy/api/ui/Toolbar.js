define(
  'ephox.alloy.api.ui.Toolbar',

  [
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.ToolbarSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!console',
    'global!Error'
  ],

function (Replacing, GuiTypes, ToolbarGroup, UiSketcher, PartType, ToolbarSchema, Arr, Merger, Json, Fun, Result, console, Error) {
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
        getGroupContainer(toolbar).fold(function (err) {
          // check that the group container existed. It may not have if the components
          // did not list anything, and shell was false.
          console.error('Toolbar was defined to not be a shell, but no groups container was specified in components');
          console.error(Json.stringify(spec, null, 2));
          throw new Error(err);
        }, function (container) {
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
              grp,
              detail.members().group().munge()(grp)
            )
          );
        });
      };

      var extra = (function () {
        if (detail.shell()) {
          return {
            // TODO: Consolidate this "entirety"
            base: Merger.deepMerge(detail.parts().groups().getOrDie(
              'Shell mode specified for toolbar, but no groups part provided'
            ).entirety(), enhanceGroups(detail)),
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
      return UiSketcher.composite('toolbar', schema, partTypes, make, spec);
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