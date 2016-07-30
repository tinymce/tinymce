test(
  'ObjProcessor Test',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldValidation',
    'ephox.boulder.api.Fields',
    'ephox.boulder.api.ObjProcessor',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (FieldPresence, FieldValidation, Fields, ObjProcessor, Fun, Option) {
    var data = {
      alpha: 'Alpha',
      beta: 'Beta',
      gamma: 'Gamma',
      betaObj: {
        betaObj1: 'Beta Obj1',
        betaObj2: 'Beta Obj2'
      },
      betaArr: {
        betaArr1: 'Beta Arr1',
        betaArr2: 'Beta Arr2'
      }
    };

    var checkError = function (expected, label, object, field) {
      var actual = ObjProcessor.doExtractOne([ label ], object, field, Fun.identity);
      actual.fold(function (errs) {
        // May need to do a starts with if the JSON stringify is not deterministic
        assert.eq(expected, errs);
      }, function (value) {
        assert.fail('Expected ' + label + ' to fail. Succeeded instead with: ' + JSON.stringify(value, 2, null));
      });
    };

    var checkResult = function (expected, label, object, field) {
      var actual = ObjProcessor.doExtractOne([ label ], object, field, Fun.identity);
      actual.fold(function (errs) {
        assert.fail('Expected ' + label + ' to succeed. Failed instead with: ' + JSON.stringify(errs, 2, null));
      }, function (value) {
        assert.eq(
          expected,
          value, 
          'Test: ' + label + 
            '\n.Expected value: ' + 
            JSON.stringify(expected, 2, null) + 
            '\nWas: ' + JSON.stringify(value, 2, null)
        );
      });
    };

    var checkOptResult = function (expKey, expectedValue, label, object, field) {
      var actual = ObjProcessor.doExtractOne([ label ], object, field, Fun.identity);
      actual.fold(function (errs) {
        assert.fail('Expected ' + label + ' to succeed. Failed instead with: ' + JSON.stringify(errs, 2, null));
      }, function (valueObj) {
        var actualValue = valueObj[expKey];
        console.log('actualValue', actualValue, 'valueObj', valueObj);
        actualValue.fold(function () {
          expectedValue.fold(function () {
            // Success.
          }, function (se) {
            assert.fail('Test: ' + label + '\nExpected Result(Option.some(' + 
              JSON.stringify(se, null, 2) + '))\nActual: ' + 'Result(Option.none())');
          });
        }, function (sv) {
          expectedValue.fold(function () {
            assert.fail('Test: ' + label + '\nExpected Result(Option.none())\nActual: ' + 'Result(Option.some(' + 
              JSON.stringify(sv, null, 2) + '))');
          }, function (se) {
            assert.eq(
              se,
              sv, 
              'Test: ' + label + 
                '\n.Expected value: ' + 
                JSON.stringify(se, 2, null) + 
                '\nWas: ' + JSON.stringify(sv, 2, null)
            );
          });
        });
      });
    };

    checkError(
      [ 'Failed Path: test.strict.absent\nCould not find valid *strict* value for "alpha" in {}' ],
      'test.strict.absent',
      { },
      Fields.prop('alpha', 'output.alpha', FieldPresence.strict(), FieldValidation.none())
    );

    checkResult(
      { 'output.alpha': 'strict.alpha' },
      'test.strict.supplied',
      { 'alpha': 'strict.alpha' },
      Fields.prop('alpha', 'output.alpha', FieldPresence.strict(), FieldValidation.none())
    );

    checkResult(
      { 'output.alpha': 'supplied.alpha' },
      'test.default.supplied',
      { 'alpha': 'supplied.alpha' },
      Fields.prop('alpha', 'output.alpha', FieldPresence.defaulted('default.alpha'), FieldValidation.none())
    );    

    checkResult(
      { 'output.alpha': 'default.alpha' },
      'test.default.absent',
      { },
      Fields.prop('alpha', 'output.alpha', FieldPresence.defaulted('default.alpha'), FieldValidation.none())
    );

    checkOptResult(
      'output.alpha',
      Option.none(),
      'test.option.absent',
      { },
      Fields.prop('alpha', 'output.alpha', FieldPresence.asOption(), FieldValidation.none())
    ); 

    checkOptResult(
      'output.alpha',
      Option.some('option.alpha'),
      'test.option.supplied',
      { 'alpha': 'option.alpha' },
      Fields.prop('alpha', 'output.alpha', FieldPresence.asOption(), FieldValidation.none())
    );

    checkError(
      [ 'Failed Path: test.strict.group.entirely.absent\nCould not find valid *strict* value for "alpha" in {}' ],
      'test.strict.group.entirely.absent',
      { },
      Fields.obj('alpha', 'output.alpha', FieldPresence.strict(), [

      ])
    );

    checkError(
      [ 'Failed Path: test.strict.group.with.missing.strict.child > alpha\nCould not find valid *strict* value for "alpha.child" in {}' ],
      'test.strict.group.with.missing.strict.child',
      { 'alpha': { } },
      Fields.obj('alpha', 'output.alpha', FieldPresence.strict(), [
        Fields.prop('alpha.child', 'output.alpha.child', FieldPresence.strict(), FieldValidation.none())
      ])
    );

    checkError(
      [ 
        'Failed Path: test.strict.group.with.missing.strict.children > alpha\nCould not find valid *strict* value for "alpha.child.1" in {}',
        'Failed Path: test.strict.group.with.missing.strict.children > alpha\nCould not find valid *strict* value for "alpha.child.2" in {}'
      ],
      'test.strict.group.with.missing.strict.children',
      { 'alpha': { } },
      Fields.obj('alpha', 'output.alpha', FieldPresence.strict(), [
        Fields.prop('alpha.child.1', 'output.alpha.child.1', FieldPresence.strict(), FieldValidation.none()),
        Fields.prop('alpha.child.2', 'output.alpha.child.2', FieldPresence.strict(), FieldValidation.none())
      ])
    );

    checkError(
      [ 
        'Failed Path: test.strict.group.with.only.one.missing.child > alpha\nCould not find valid *strict* value for "alpha.child.2" in ' + JSON.stringify({ 'alpha.child.1': '10' }, null, 2)
      ],
      'test.strict.group.with.only.one.missing.child',
      { 'alpha': { 'alpha.child.1': '10' } },
      Fields.obj('alpha', 'output.alpha', FieldPresence.strict(), [
        Fields.prop('alpha.child.1', 'output.alpha.child.1', FieldPresence.strict(), FieldValidation.none()),
        Fields.prop('alpha.child.2', 'output.alpha.child.2', FieldPresence.strict(), FieldValidation.none())
      ])
    );

    checkResult(
      { 'output.alpha': { 'alpha.child': 10 }},
      'test.strict.group.with.defaulted.child',
      {
        alpha: { }
      },
      Fields.obj('alpha', 'output.alpha', FieldPresence.strict(), [
        Fields.prop('alpha.child', 'output.alpha.child', FieldPresence.defaulted(10), FieldValidation.none())
      ])
    );

    // Maybe make the syntax nicer.
    var output = ObjProcessor.weak([ 'test.1' ], data, [
      Fields.prop('alpha', 't.alpha', FieldPresence.strict(), FieldValidation.none()),
      Fields.prop('delta', 't.delta', FieldPresence.defaulted('default.Delta'), FieldValidation.none())
    ]);

    assert.eq({
      't.alpha': 'Alpha',
      't.delta': 'default.Delta'
    }, output);

    // assert.eq(1, 2);
  }
);