define(
  'ephox.alloy.api.ui.InlineView',

  [

  ],

  function () {
    var schema = [
      // FieldSchema.strict('dom'),
      // FieldSchema.option('action'),
      // FieldSchema.option('role')
    ];

    // Dupe with Tiered Menu
    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('TieredMenu', schema, spec, [ ]);
      return ButtonSpec.make(detail, spec);
    };

    return {
      build: build,
      partial: Fun.identity
    };
  }
);