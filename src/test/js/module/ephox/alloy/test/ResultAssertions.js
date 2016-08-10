define(
  'ephox.alloy.test.ResultAssertions',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.compass.Arr'
  ],

  function (RawAssertions, Arr) {
    var checkErr = function (label, expectedPart, f) {
      var actual = f();
      actual.fold(function (err) {
        var errMessage = Arr.map(err, function (e) {
          return e.message !== undefined ? e.message : e;
        }).join('');
        // Not using message when coming from getOrDie
        RawAssertions.assertEq(
          label + 'Expecting to contain("' + expectedPart + '")\nActual: ' + errMessage,
          true,
          errMessage.indexOf(expectedPart) > -1
        );
      }, function (val) {
        assert.fail('Expected error containing("' + expectedPart + '") was not thrown');
      });
    };

    var checkVal = function (label, f, assertValue) {
      var actual = f();
      actual.fold(function (err) {
        assert.fail('Unexpected error: ', err);
      }, function (value) {
        assertValue(value);
      });
    };

    return {
      checkErr: checkErr,
      checkVal: checkVal
    };
  }
);