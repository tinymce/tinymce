test(
  'BehavioursTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects'
  ],

  function (RawAssertions, BehaviourExport, FieldSchema, Objects) {
    var schema = [
      FieldSchema.strict('a')
    ];

    var scorps = BehaviourExport.santa(
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
      spec.scorps._raw
    );

    console.log('spec', spec);
  }
);