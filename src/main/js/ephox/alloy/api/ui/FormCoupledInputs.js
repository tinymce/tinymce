define(
  'ephox.alloy.api.ui.FormCoupledInputs',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.FormCoupledInputsSchema',
    'ephox.katamari.api.Fun'
  ],

  function (UiSketcher, PartType, FormCoupledInputsSchema, Fun) {
    var schema = FormCoupledInputsSchema.schema();
    var partTypes = FormCoupledInputsSchema.parts();

    var sketch = function (spec) {
      return UiSketcher.composite(FormCoupledInputsSchema.name(), schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) { 
      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components
      };
    };

    var parts = PartType.generate(FormCoupledInputsSchema.name(), partTypes);

    return {
      sketch: sketch,
      parts: Fun.constant(parts)
    };
  }
);