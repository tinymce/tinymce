define(
  'ephox.alloy.api.ui.Typeahead',

  [
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.composite.TypeaheadSpec',
    'ephox.alloy.ui.schema.TypeaheadSchema'
  ],

  function (Sketcher, TypeaheadSpec, TypeaheadSchema) {
    return Sketcher.composite({
      name: 'Typeahead',
      configFields: TypeaheadSchema.schema(),
      partFields: TypeaheadSchema.parts(),
      factory: TypeaheadSpec.make
    });
  }
);