test(
  'BehavioursTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.compass.Obj',
    'ephox.peanut.Fun'
  ],

  function (RawAssertions, Behaviour, FieldSchema, Objects, Obj, Fun) {
    var schema = [
      FieldSchema.strict('a')
    ];

    var scorps = Behaviour.create(
      schema,
      'scorps',
      { },
      { }
    );

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
      spec.scorps
    );

    
  }
);