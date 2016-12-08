define(
  'ephox.alloy.api.ui.Button',

  [
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema'
  ],

  function (ButtonSpec, SpecSchema, FieldSchema) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.option('action'),
      FieldSchema.option('role')
    ];

    // Dupe with Tiered Menu
    var build = function (f) {
      var spec = f();
      var detail = SpecSchema.asStructOrDie('TieredMenu', schema, spec, [ ]);
      return ButtonSpec.make(detail, spec);
    };

    return {
      build: build
    };
  }
);