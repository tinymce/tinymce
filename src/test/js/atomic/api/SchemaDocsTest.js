test(
  'SchemaDocsTest',
  
  [
    'ephox.agar.api.RawAssertions',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema'
  ],

  function (RawAssertions, FieldSchema, ValueSchema) {
    var schema = ValueSchema.objOf([
      FieldSchema.defaulted('This is it')
    ]);

    var s = schema.toString();

    RawAssertions.assertEq(
      'Check',
      'a',
      s
    );
  }
)