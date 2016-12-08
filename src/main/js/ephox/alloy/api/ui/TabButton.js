define(
  'ephox.alloy.api.ui.TabButton',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.ui.single.TabButtonSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger'
  ],

  function (Tagger, SpecSchema, TabButtonSpec, FieldSchema, Merger) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.option('action'),
      FieldSchema.option('role')
    ];

    // Dupe with Button
    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('TabButton', schema, spec, [ ]);
      return TabButtonSpec.make(detail, spec);
    };

    return {
      build: build
    };
  }
);