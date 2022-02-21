import { Logger } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';

import * as FieldSchema from 'ephox/boulder/api/FieldSchema';
import * as Objects from 'ephox/boulder/api/Objects';
import * as StructureSchema from 'ephox/boulder/api/StructureSchema';
import * as ValueType from 'ephox/boulder/core/ValueType';

UnitTest.test('Atomic Test: api.StructureSchemaFuncTest', () => {
  const checkErr = (label, expectedPart, v, processor) => {
    // NOTE: v is not a function here.
    StructureSchema.asRaw(label, processor, v).fold((err) => {
      const message = StructureSchema.formatError(err);
      Assert.eq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + message, true, message.indexOf(expectedPart) > -1);
    }, (val) => {
      Assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + JSON.stringify(val, null, 2) + ')');
    });
  };

  const checkRawErrIs = (label, expectedPart, applicator, f, processor) => {
    Logger.sync(label, () => {
      const newF = StructureSchema.asRaw<any>(label, processor, f).getOrDie();
      let passed = null;

      try {
        const val = newF(f);
        passed = val;
      } catch (err) {
        const message = err.message;
        Assert.eq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + message, true, message.indexOf(expectedPart) > -1);
      }

      if (passed !== null) {
        Assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + JSON.stringify(passed, null, 2) + ')');
      }
    });
  };

  const checkRawResultIs = (label, expected, applicator, f, processor) => {
    Logger.sync(label, () => {
      const actual = StructureSchema.asRawOrDie(label, processor, f);
      const result = applicator(actual);
      Assert.eq(label + ', checking result', expected, result);
    });
  };

  const getter1 = (...args: string[]) => {
    return args.join('.');
  };

  checkErr(
    'Not passing through a function',
    'Not a function',
    10,
    StructureSchema.funcOrDie([ 'a', 'b' ], ValueType.anyValue())
  );

  checkRawResultIs(
    'Trim an argument, no postprocess',
    'a.b',
    (f) => {
      return f('a', 'b', 'c');
    },
    getter1,
    StructureSchema.funcOrDie([ 'a', 'b' ], ValueType.anyValue())
  );

  checkRawErrIs(
    'Checking if validation fails in postprocessing',
    'wrong value',
    (f) => {
      return f('x');
    },
    (_v) => {
      return 'y';
    },
    StructureSchema.funcOrDie([ 'value' ], StructureSchema.valueOf((v) => {
      return v === 'x' ? Result.value(v) : Result.error('wrong value');
    }))
  );

  const getter2 = (a) => {
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
    (f) => {
      return f('A');
    },
    getter2,
    StructureSchema.funcOrDie([ 'a' ], StructureSchema.objOf([
      FieldSchema.required('A')
    ]))
  );

  const getter3 = (one, two, three) => {
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
    (f) => {
      return f('cat', 'dog', 'elephant');
    },
    getter3,
    StructureSchema.funcOrDie([ 'one', 'two' ], StructureSchema.arrOfObj([
      FieldSchema.required('firstname'),
      FieldSchema.required('surname')
    ]))
  );

});
