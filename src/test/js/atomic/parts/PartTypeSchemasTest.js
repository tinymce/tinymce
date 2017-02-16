test(
  'Atomic Test: parts.PartTypeSchemasTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.ValueSchema',
    'global!console'
  ],

  function (RawAssertions, PartType, ValueSchema, console) {
    var alpha = PartType.internal(
      { sketch: function (x) { return 'sketch.' + x; } },
      [ ],
      'alpha',
      '<part.alpha>',
      function () {
        return {
          value: 10
        };
      },
      function () {
        return {
          otherValue: 15
        };
      }
    );

    var schemas = PartType.schemas([ alpha ]);

      //     { setOf: [ 'validator', 'valueType' ] },
      // { arrOf: [ 'valueType' ] },
      // { objOf: [ 'fields' ] },
      // { itemOf: [ 'validator' ] },
      // { choiceOf: [ 'key', 'branches' ] }

    var schema = ValueSchema.objOf(schemas);

    var output = ValueSchema.asRawOrDie(
      'Test 1',
      schema,
      {
        alpha: 'alpha.schema'
      }
    );

    RawAssertions.assertEq(
      'Checking the value of test1',
      {
        alpha: {
          entirety: 'alpha.schema'
        }
      },
      output
    );

    console.log('schema', output);


  }
);
