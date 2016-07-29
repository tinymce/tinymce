test(
  'ObjProcessor Test',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldValidation',
    'ephox.boulder.api.Fields',
    'ephox.boulder.api.ObjProcessor',
    'ephox.peanut.Fun'
  ],

  function (FieldPresence, FieldValidation, Fields, ObjProcessor, Fun) {
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
        assert.eq([ expected ], errs);
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

    checkError(
      'Failed Path: test.strict.absent\nCould not find valid *strict* value for "alpha" in {}',
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