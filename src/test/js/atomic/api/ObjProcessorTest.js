test(
  'ObjProcessor Test',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldValidation',
    'ephox.boulder.api.Fields',
    'ephox.boulder.api.ObjProcessor'
  ],

  function (FieldPresence, FieldValidation, Fields, ObjProcessor) {
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