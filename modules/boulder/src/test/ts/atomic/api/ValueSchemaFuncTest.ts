import { Logger } from '@ephox/agar';
import { Assert, assert, UnitTest } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';
import * as FieldSchema from 'ephox/boulder/api/FieldSchema';
import * as Objects from 'ephox/boulder/api/Objects';
import * as ValueSchema from 'ephox/boulder/api/ValueSchema';

UnitTest.test('Atomic Test: api.ValueSchemaFuncTest', function () {
  const checkErr = function (label, expectedPart, v, processor) {
    // NOTE: v is not a function here.
    ValueSchema.asRaw(label, processor, v).fold(function (err) {
      const message = ValueSchema.formatError(err);
      Assert.eq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + message, true, message.indexOf(expectedPart) > -1);
    }, function (val) {
      assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + JSON.stringify(val, null, 2) + ')');
    });
  };

  const checkRawErrIs = function (label, expectedPart, applicator, f, processor) {
    Logger.sync(label, function () {
      const newF = ValueSchema.asRaw<any>(label, processor, f).getOrDie();
      let passed = null;

      try {
        const val = newF(f);
        passed = val;
      } catch (err) {
        const message = err.message;
        Assert.eq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + message, true, message.indexOf(expectedPart) > -1);
      }

      if (passed !== null) { assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + JSON.stringify(passed, null, 2) + ')'); }
    });
  };

  const checkRawResultIs = function (label, expected, applicator, f, processor) {
    Logger.sync(label, function () {
      const actual = ValueSchema.asRawOrDie(label, processor, f);
      const result = applicator(actual);
      Assert.eq(label + ', checking result', expected, result);
    });
  };

  const getter1 = function (a, b, c) {
    const args = Array.prototype.slice.call(arguments, 0);
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

  const getter2 = function (a) {
    return Objects.wrapAll([
      { key: a, value: a + '-value' },
      { key: 'other', value: 'other-value' }
    ]);
  };

  checkRawResultIs(
    'Running a schema on the output',
    {
      A: 'A-value'
    },
    function (f) {
      return f('A');
    },
    getter2,
    ValueSchema.funcOrDie([ 'a' ], ValueSchema.objOf([
      FieldSchema.strict('A')
    ]))
  );

  const getter3 = function (one, two, three) {
    return [
      { firstname: one + '.1', middlename: one + '.2', surname: one + '.3' },
      { firstname: two + '.1', middlename: two + '.2', surname: two + '.3' },
      { firstname: three + '.1', middlename: three + '.2', surname: three + '.3' }
    ];
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
