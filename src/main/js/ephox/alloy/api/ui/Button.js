define(
  'ephox.alloy.api.ui.Button',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger'
  ],

  function (Tagger, ButtonSpec, SpecSchema, FieldSchema, Merger) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.option('action'),
      FieldSchema.option('role')
    ];

    // Dupe with Tiered Menu
    var build = function (f) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, f());
      var detail = SpecSchema.asStructOrDie('TieredMenu', schema, spec, [ ]);
      return ButtonSpec.make(detail, spec);
    };

    return {
      build: build
    };
  }
);