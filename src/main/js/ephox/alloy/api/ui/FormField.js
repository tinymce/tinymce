define(
  'ephox.alloy.api.ui.FormField',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.FieldBase',
    'ephox.alloy.ui.schema.FormFieldSchema'
  ],

  function (UiSketcher, PartType, FieldBase, FormFieldSchema) {
    var schema = FormFieldSchema.schema();

    var sketch = function (factory, spec) {
      var partTypes = FormFieldSchema.makeParts(factory);
      return UiSketcher.composite('FormField(' + factory.name() + ')', schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) {
      return {
        uid: detail.uid(),
        dom: {
          tag: 'div'
        },
        components: components,
        behaviours: FieldBase.behaviours(detail),
        events: FieldBase.events(detail),
        customBehaviours: detail.customBehaviours()
      };
    };

    var parts = function (factory) {
      var partTypes = FormFieldSchema.makeParts(factory);
      return PartType.generate('FormField(' + factory.name() + ')', partTypes);
    };

    return {
      sketch: sketch,
      parts: parts
    };
  }
);