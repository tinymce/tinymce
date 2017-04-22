define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.ToolbarGroupSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'global!Error'
  ],

  function (Behaviour, UiSketcher, PartType, ToolbarGroupSchema, Fun, Merger, Error) {
    var schema = ToolbarGroupSchema.schema();
    var partTypes = ToolbarGroupSchema.parts();

    var make = function (detail, components, spec, _externals) {
      return Merger.deepMerge(
        {
          dom: {
            attributes: {
              role: 'toolbar'
            }
          }
        },
        {
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,

          behaviours: Merger.deepMerge(
            {
              keying: {
                mode: 'flow',
                selector: '.' + detail.markers().itemClass()
              },
              tabstopping: detail.hasTabstop() ? { } : Behaviour.revoke()
            },
            detail.tgroupBehaviours()
          ),

          'debug.sketcher': spec['debug.sketcher'],
          customBehaviours: detail.customBehaviours()
        }
      );
    };

    var sketch = function (spec) {
      return UiSketcher.composite(ToolbarGroupSchema.name(), schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate(ToolbarGroupSchema.name(), partTypes);

    return {
      sketch: sketch,
      parts: Fun.constant(parts)
    };
  }
);