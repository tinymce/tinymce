define(
  'ephox.alloy.api.ui.ToolbarGroup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.ToolbarGroupSchema',
    'ephox.alloy.ui.schema.ToolbarSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (Behaviour, UiBuilder, Fields, DomModification, PartType, ToolbarGroupSchema, ToolbarSchema, FieldSchema, Merger, Fun, Error) {
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

          behaviours: {
            keying: {
              mode: 'flow',
              selector: '.' + detail.markers().itemClass()
            },
            // fIX: Undefined
            tabstopping: detail.hasTabstop() ? { } : Behaviour.revoke()
          }
        }
      );
    };

    var sketch = function (spec) {
      return UiBuilder.composite(ToolbarGroupSchema.name(), schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate(ToolbarGroupSchema.name(), partTypes);

    return {
      sketch: sketch,
      parts: Fun.constant(parts)
    };
  }
);