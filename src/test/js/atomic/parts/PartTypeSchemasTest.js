test(
  'Atomic Test: parts.PartTypeSchemasTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.wrap-jsverify.Jsc',
    'global!console'
  ],

  function (RawAssertions, PartType, Objects, ValueSchema, Fun, Jsc, console) {
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

    var optional = PartType.optional(
      { sketch: function (x) { return x + '.optional'; } },
      [ ],
      'optional',
      '<part.optional>',
      Fun.constant({ defaultValue: 10 }),
      Fun.constant({ overriddenValue: 15 })
    );

    var group = PartType.group(
      { sketch: function (x) { return x + '.group' } },
      [ ],
      'group',
      'member',
      '<part.group>',
      Fun.constant({ defaultValue: 10 }),
      Fun.constant({ overriddenValue: 15 })
    );
    

    // We split up the checking functions like so:
    // checkSuccessWithNone, the non-optional parts are expected, and the optional = None
    // checkSuccessWithSome, the non-optional parts are expected, and the optional is optExpected

    var checkSuccess = function (label, expected, parts, input) {
      var schemas = PartType.schemas(parts);
      var output = ValueSchema.asRawOrDie(
        label,
        ValueSchema.objOfOnly(schemas),
        input
      );

      RawAssertions.assertEq(label, expected, output);
    };

    var checkSuccessWithNone = function (label, expected, parts, input) {
      var schemas = PartType.schemas(parts);
      var output = ValueSchema.asRawOrDie(
        label,
        ValueSchema.objOfOnly(schemas),
        input
      );

      // We can't check Optionals with eq
      var narrowed = Objects.narrow(output, [ 'internal', 'external' ]);
      RawAssertions.assertEq('narrowed.' + label, expected, narrowed);
      RawAssertions.assertEq('checking none.' + label, true, output.optional.isNone());
    };

    var checkSuccessWithSome = function (label, expected, optExpected, parts, input) {
      var schemas = PartType.schemas(parts);
      var output = ValueSchema.asRawOrDie(
        label,
        ValueSchema.objOfOnly(schemas),
        input
      );

      // We can't check Optionals with eq
      var narrowed = Objects.narrow(output, [ 'internal', 'external' ]);
      RawAssertions.assertEq('narrowed.' + label, expected, narrowed);
      RawAssertions.assertEq('checking some' + label, optExpected, output.optional.getOrDie(
        'Optional value was not set. Expecting: ' + optExpected
      ));
    };

    checkSuccess(
      'sanity: just internal',
      {
        internal: { entirety: 'internal.schema' }
      },
      [ internal ],
      { internal: 'internal.schema' }
    );

    checkSuccess(
      'sanity: just external',
      { external: { entirety: 'external.schema' } },
      [ external ],
      { external: 'external.schema' }
    );

     checkSuccess(
      'sanity: group',
      { group: { entirety: 'group.schema' } },
      [ group ],
      { group: 'group.schema' }
    );

    checkSuccessWithNone(
      'sanity: just optional and missing',
      { },
      [ optional ],
      { }
    );

    checkSuccessWithSome(
      'sanity: just optional and present',
      { },
      { entirety: 'optional.schema' },
      [ optional ],
      { optional: 'optional.schema' }
    );

    var qcheck = function (arb, checker) {
      Jsc.check(
        Jsc.forall(arb, function (input) {
          checker(input);
          return true;
        })
      );
    };

    // MIGRATION: Use wrap-vsverify when migrating
    qcheck(Jsc.string, function (s) {
      checkSuccess(
        'just internal',
        {
          internal: { entirety: s }
        },
        [ internal ],
        { internal: s }
      );
    });

    qcheck(Jsc.string, function (s) {
      checkSuccess(
        'just external',
        {
          external: { entirety: s }
        },
        [ external ],
        { external: s }
      );
    });

    qcheck(Jsc.string, function (s) {
      checkSuccess(
        'just group',
        {
          group: { entirety: s }
        },
        [ group ],
        { group: s }
      );
    });


  }
);
