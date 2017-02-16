test(
  'Atomic Test: parts.PartTypeSchemasTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'global!console'
  ],

  function (RawAssertions, PartType, ValueSchema, Fun, console) {
    // { external: [ 'factory', 'schema', 'name', 'defaults', 'overrides' ] },
    //   { optional: [ 'factory', 'schema', 'name', 'pname', 'defaults', 'overrides' ] },
    //   { group: [ 'factory', 'schema', 'name', 'unit', 'pname', 'defaults', 'overrides' ] }

    var internal = PartType.internal(
      { sketch: function (x) { return 'sketch.' + x; } },
      [ ],
      'internal',
      '<part.internal>',
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

    var external = PartType.external(
      { sketch: function (x) { return x + '.external'; } },
      [ ],
      'external',
      Fun.constant({ defaultValue: 10 }),
      Fun.constant({ overriddenValue: 15 })
    );
    
    var schemas = PartType.schemas([ internal, external ]);

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
        internal: 'internal.schema',
        external: 'external.schema'
      }
    );

    RawAssertions.assertEq(
      'Checking the value of test1',
      {
        internal: {
          entirety: 'internal.schema'
        },
        external: {
          entirety: 'external.schema'
        }
      },
      output
    );

    console.log('schema', output);


  }
);
