define(
  'ephox.alloy.api.ui.Typeahead',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.composite.TypeaheadSpec',
    'ephox.alloy.ui.schema.TypeaheadSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (Representing, UiSketcher, TypeaheadSpec, TypeaheadSchema, Merger, Fun) {
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