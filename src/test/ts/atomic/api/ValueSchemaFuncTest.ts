import { RawAssertions, Logger } from '@ephox/agar';
import FieldSchema from 'ephox/boulder/api/FieldSchema';
import Objects from 'ephox/boulder/api/Objects';
import ValueSchema from 'ephox/boulder/api/ValueSchema';
import { Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Atomic Test: api.ValueSchemaFuncTest', function() {
  var checkErr = function (label, expectedPart, v, processor) {
    // NOTE: v is not a function here.
    ValueSchema.asRaw(label, processor, v).fold(function (err) {
      var message = ValueSchema.formatError(err);
      RawAssertions.assertEq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + message, true, message.indexOf(expectedPart) > -1);
    }, function (val) {
      assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + Json.stringify(val, null, 2) + ')');
    });
  };

  var checkRawErrIs = function (label, expectedPart, applicator, f, processor) {
    Logger.sync(label, function () {
      var newF = ValueSchema.asRaw(label, processor, f).getOrDie();
      var passed = null;

      try {
        var val = newF(f);
        passed = val;  
      } catch (err) {
        var message = err.message;
        RawAssertions.assertEq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + message, true, message.indexOf(expectedPart) > -1);
      }

      if (passed !== null) assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + Json.stringify(passed, null, 2) + ')');
    });      
  };

  var checkRawResultIs = function (label, expected, applicator, f, processor) {
    Logger.sync(label, function () {
      var actual = ValueSchema.asRawOrDie(label, processor, f);
      var result = applicator(actual);
      RawAssertions.assertEq(label + ', checking result', expected, result);
    });
  };

  var getter1 = function (a, b, c) {
    var args = Array.prototype.slice.call(arguments, 0);
    return args.join('.');
  };

  checkErr(
    'Not passing through a function',
    'Not a function',
    10,
    ValueSchema.funcOrDie([ 'a', 'b' ], ValueSchema.anyValue())
  );

  checkRawResultIs(
    'Trim an argument, no postprocess',
    'a.b',
    function (f) {
      return f('a', 'b', 'c');
    },
    getter1,
    ValueSchema.funcOrDie([ 'a', 'b' ], ValueSchema.anyValue())
  );

  checkRawErrIs(
    'Checking if validation fails in postprocessing',
    'wrong value',
    function (f) {
      return f('x');
    },
    function (v) {
      return 'y';
    },
    ValueSchema.funcOrDie([ 'value' ], ValueSchema.valueOf(function (v) {
      return v === 'x' ? Result.value(v) : Result.error('wrong value');
    }))
  );

  var getter2 = function (a) {
    return Objects.wrapAll([
      { key: a, value: a + '-value' },
      { key: 'other', value: 'other-value' }
    ]);
  };

  checkRawResultIs(
    'Running a schema on the output',
    {
      'A': 'A-value'
    },
    function (f) {
      return f('A');
    },
    getter2,
    ValueSchema.funcOrDie([ 'a' ], ValueSchema.objOf([
      FieldSchema.strict('A')
    ]))
  );

  var getter3 = function (one, two, three) {
    return [
      { firstname: one + '.1', middlename: one + '.2', surname: one + '.3' },
      { firstname: two + '.1', middlename: two + '.2', surname: two + '.3' },
      { firstname: three + '.1', middlename: three + '.2', surname: three + '.3' }
    ]
  };

  checkRawResultIs(
    'Truncating output and passing through undefined',
    [
      { firstname: 'cat.1', surname: 'cat.3' },
      { firstname: 'dog.1', surname: 'dog.3' },
      { firstname: 'undefined.1', surname: 'undefined.3' }
    ],
    function (f) {
      return f('cat', 'dog', 'elephant');
    },
    getter3,
    ValueSchema.funcOrDie([ 'one', 'two' ], ValueSchema.arrOfObj([
      FieldSchema.strict('firstname'),
      FieldSchema.strict('surname')
    ]))
  );

});
