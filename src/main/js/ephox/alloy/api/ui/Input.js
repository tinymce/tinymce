define(
  'ephox.alloy.api.ui.Input',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.common.InputBase',
    'ephox.alloy.ui.schema.InputSchema',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun'
  ],

  function (UiSketcher, InputBase, InputSchema, Merger, Fun) {
    var schema = InputSchema.schema();

    var sketch = function (spec) {
      return UiSketcher.single(InputSchema.name(), schema, make, spec);
    };

    var make = function (detail, spec) {
      return {
        uid: detail.uid(),
        dom: InputBase.dom(detail),
        // No children.
        components: [ ],
        behaviours: Merger.deepMerge(
          InputBase.behaviours(detail),
          detail.inputBehaviours()
        ),
        customBehaviours: detail.customBehaviours()
      };
    };

    return {
      sketch: sketch,
      name: Fun.constant(InputSchema.name())
    };
  }
);