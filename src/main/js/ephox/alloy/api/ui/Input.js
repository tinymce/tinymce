define(
  'ephox.alloy.api.ui.Input',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.common.InputBase',
    'ephox.alloy.ui.schema.InputSchema',
    'ephox.katamari.api.Fun'
  ],

  function (UiSketcher, InputBase, InputSchema, Fun) {
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
        behaviours: InputBase.behaviours(detail),
        customBehaviours: detail.customBehaviours(),
        eventOrder: detail.eventOrder()
      };
    };

    return {
      sketch: sketch,
      name: Fun.constant(InputSchema.name())
    };
  }
);