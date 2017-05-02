define(
  'ephox.alloy.api.ui.Toolbar',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.ToolbarSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Result',
    'ephox.sand.api.JSON',
    'global!console',
    'global!Error'
  ],

function (Behaviour, Replacing, GuiTypes, ToolbarGroup, UiSketcher, PartType, ToolbarSchema, Arr, Fun, Merger, Result, Json, console, Error) {
    var schema = ToolbarSchema.schema();

    // TODO: Dupe with ToolbarSchema
    var enhanceGroups = function (detail) {
      return {
        behaviours: Behaviour.derive([
          Replacing.config({ })
        ])
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
            detail.members().group().munge()(grp)
          );
        });
      };

      var extra = (function () {
        if (detail.shell()) {
          return {
            base: Merger.deepMerge(detail.parts().groups().getOrDie(
              'Shell mode specified for toolbar, but no groups part provided'
            )[PartType.original()](), enhanceGroups(detail)),
            comps: [ ]
          };
        } else {
          return {
            base: { },
            comps: components
          };
        }
      })();

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

          behaviours: detail.toolbarBehaviours(),
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