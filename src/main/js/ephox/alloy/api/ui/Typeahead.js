define(
  'ephox.alloy.api.ui.Typeahead',

  [
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.InputBase',
    'ephox.alloy.ui.composite.TypeaheadSpec',
    'ephox.alloy.ui.schema.TypeaheadSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.violin.Strings'
  ],

  function (Coupling, Representing, Sandboxing, UiSketcher, EventHandler, Fields, ItemEvents, PartType, InputBase, TypeaheadSpec, TypeaheadSchema, FieldSchema, Objects, Merger, Fun, Option, Cell, Strings) {
    var schema = TypeaheadSchema.schema();
    var partTypes = TypeaheadSchema.parts();

    var sketch = function (spec) {
      var specWithFetch = Merger.deepMerge(spec, {
        fetch: function (input) {
          var val = Representing.getValue(input);
          return spec.fetch(input, val.text);
        }
      });
      return UiSketcher.composite(TypeaheadSchema.name(), schema, partTypes, TypeaheadSpec.make, specWithFetch);
    };

    return {
      // Used so that it can be a form factory
      name: Fun.constant(TypeaheadSchema.name()),
      sketch: sketch
    };
  }
);