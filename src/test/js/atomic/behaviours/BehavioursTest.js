test(
  'BehavioursTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema'
  ],

  function (RawAssertions, FieldSchema, Objects, ValueSchema) {
    var schema = function (s) {
      return ValueSchema.asStructOrDie('blah', ValueSchema.objOf([
        FieldSchema.strict('a')
      ]), s);
    };
    var scorps = {
      config: function (s) {
        return {
          key: 'scorps',
          value: {
            raw: s,
            info: schema(s)
          }
        };
      }
    };

    var derive = function (caps) {
      return Objects.wrapAll(caps);
    };

    var spec = derive([
      scorps.config({
        a: 'b'
      })
    ]);

    RawAssertions.assertEq(
      'Something',
      { 'a': 'b' },
      spec.scorps.raw
    );

    console.log('spec', spec);
  }
);