test(
  'Atomic Test: api.ValueSchemaFuncTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.sand.api.JSON'
  ],

  function (RawAssertions, FieldSchema, ValueSchema, Json) {
    var checkErr = function (label, expectedPart, input, processor) {
      ValueSchema.asRaw(label, processor, input).fold(function (err) {
        var message = ValueSchema.formatError(err);
        RawAssertions.assertEq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + message, true, message.indexOf(expectedPart) > -1);
      }, function (val) {
        assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + Json.stringify(val, null, 2) + ')');
      });
    };

    var check = function (label, input, processor) {
      var actual = ValueSchema.asRawOrDie(label, processor, input);
      RawAssertions.assertEq(label, input, actual);
    };

    var checkResultIs = function (label, expected, applicator, f, processor) {
      var actual = ValueSchema.asRawOrDie(label, processor, f);
      var result = applicator(actual);
      RawAssertions.assertEq(label + ', checking result', expected, result);
    };

    var getter1 = function (a, b, c) {
      var args = Array.prototype.slice.call(arguments, 0);
      return args.join('.');
    };
  
    checkResultIs(
      'test.1',
      'a.b',
      function (f) {
        return f('a', 'b', 'c');
      },
      getter1,
      ValueSchema.func([ 'a', 'b' ], ValueSchema.anyValue())
    );
  }
);
