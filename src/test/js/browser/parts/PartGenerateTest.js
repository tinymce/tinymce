test(
  'Atomic Test: parts.GenerateTest',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Obj'
  ],

  function (Logger, RawAssertions, AlloyParts, PartType, FieldSchema, Objects, Obj) {
    var schema = [
      FieldSchema.strict('test-data'),
      FieldSchema.state('state', function () {
        return 'state';
      })
    ];

    var internal = PartType.required({
      name: 'name.1',
      pname: 'name.part.1',
      schema: schema
    });

    var external = PartType.external({
      name: 'name.2',
      schema: schema
    });

    var optional = PartType.optional({
      name: 'name.3',
      pname: 'name.part.3',
      schema: schema
    });

    var group = PartType.group({
      name: 'name.4',
      unit: 'unit.4',
      pname: 'name.part.4',
      schema: schema
    });

    var check = function (label, expected, parts) {
      Logger.sync(label, function () {
        var data = { 'test-data': label };
        var generated = AlloyParts.generate('owner', parts);

        // Check that config and validated match what was passed through
        Obj.each(generated, function (g, k) {
          var output = g(data);
          RawAssertions.assertEq('Checking config', data, output.config);
          RawAssertions.assertEq('Checking validated', {
            'test-data': data['test-data'],
            state: 'state'
          }, output.validated);
        });

        RawAssertions.assertEq(
          'Checking PartType.generate',
          expected,
          Obj.map(generated, function (g) {
            var output = g(data);
            return Objects.exclude(output, [ 'config', 'validated' ]);
          })
        );
      });
    };

    check(
      'Internal',
      {
        'name.1': {
          uiType: 'placeholder',
          owner: 'owner',
          name: 'name.part.1'
        }
      },
      [ internal ]
    );

    check(
      'External',
      { },
      [ external ]
    );

    check(
      'Optional',
      {
        'name.3': {
          uiType: 'placeholder',
          owner: 'owner',
          name: 'name.part.3'
        }
      },
      [ optional ]
    );

    check(
      'Group',
      {
        'name.4': {
          uiType: 'placeholder',
          owner: 'owner',
          name: 'name.part.4'
        }
      },
      [ group ]
    );

  }
);
