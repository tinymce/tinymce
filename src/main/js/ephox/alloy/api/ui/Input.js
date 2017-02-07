define(
  'ephox.alloy.api.ui.Input',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.ui.common.InputBase',
    'ephox.alloy.ui.schema.InputSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (UiBuilder, InputBase, InputSchema, FieldSchema, Merger, Fun) {
    var schema = InputSchema.schema();

    var sketch = function (spec) {
      return UiBuilder.single(InputSchema.name(), schema, make, spec);
    };

    var make = function (detail, spec) {
      return Merger.deepMerge(spec, {
        uid: detail.uid(),
        dom: InputBase.dom(detail),
        // No children.
        components: [ ],
        behaviours: InputBase.behaviours(detail)
      });
    };

    return {
      sketch: sketch,
      name: Fun.constant(InputSchema.name())
    };
  }
);