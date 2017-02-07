define(
  'ephox.alloy.api.ui.FormCoupledInputs',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.FormCoupledInputsSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Composing, Toggling, Button, FormField, Input, UiBuilder, EventHandler, Fields, PartType, FormCoupledInputsSchema, FieldSchema, Fun, Option) {
    var schema = FormCoupledInputsSchema.schema();
    var partTypes = FormCoupledInputsSchema.parts();

    var build = function (spec) {
      return UiBuilder.composite(FormCoupledInputsSchema.name(), schema, partTypes, make, spec);
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
      build: build,
      parts: Fun.constant(parts)
    };
  }
);