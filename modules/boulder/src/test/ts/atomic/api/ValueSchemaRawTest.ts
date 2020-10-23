import { Logger } from '@ephox/agar';
import { Assert, assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Result } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import * as FieldPresence from 'ephox/boulder/api/FieldPresence';
import * as FieldSchema from 'ephox/boulder/api/FieldSchema';
import { Processor } from 'ephox/boulder/api/Main';
import * as Objects from 'ephox/boulder/api/Objects';
import * as ValueSchema from 'ephox/boulder/api/ValueSchema';

UnitTest.test('ValueSchemaRawTest', function () {
  const checkErr = function (label: string, expectedPart: string, input: any, processor: Processor) {
    ValueSchema.asRaw(label, processor, input).fold(function (err) {
      const message = ValueSchema.formatError(err);
      Assert.eq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + message, true, message.indexOf(expectedPart) > -1);
    }, function (val) {
      assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + JSON.stringify(val, null, 2) + ')');
    });
  };

  const check = function (label: string, input: any, processor: Processor) {
    const actual = ValueSchema.asRawOrDie(label, processor, input);
    Assert.eq(label, input, actual);
  };

  const checkIs = function (label: string, expected: any, input: any, processor: Processor) {
    const actual = ValueSchema.asRawOrDie(label, processor, input);
    Assert.eq(label, expected, actual);
  };

  check('test.1', 10, ValueSchema.anyValue());

  check('test.2', [ 10, 20, 50 ], ValueSchema.arrOfVal());

  check('test.3', {
    a: 'a',
    b: 'b'
  }, ValueSchema.objOf([
    FieldSchema.strict('a'),
    FieldSchema.strict('b')
  ]));

  checkIs('test.3 (with extra)', {
    a: 'a',
    b: 'b'
  }, {
    a: 'a',
    b: 'b',
    c: 'c'
  }, ValueSchema.objOf([
    FieldSchema.strict('a'),
    FieldSchema.strict('b')
  ]));

  checkErr(
    'test.3 (with extra and only) and two fields',
    'unsupported fields: [c]',
    {
      a: 'a',
      b: 'b',
      c: 'c'
    },
    ValueSchema.objOfOnly([
      FieldSchema.strict('a'),
      FieldSchema.strict('b')
    ])
  );

  checkErr(
    'test.3 (with extra and only) and no fields',
    'unsupported fields: [aa]',
    {
      aa: 'aa'
    },
    ValueSchema.objOfOnly([

    ])
  );

  check(
    'test.3 with no forbidden field',
    {
      a: 'a',
      b: 'b'
    },
    ValueSchema.objOfOnly([
      FieldSchema.strict('a'),
      FieldSchema.strict('b')
    ])
  );

  checkErr(
    'test.3 with 1 forbidden field',
    'Do not use c. Use b',
    {
      a: 'a',
      b: 'b',
      c: 'c'
    },
    ValueSchema.objOf([
      FieldSchema.strict('a'),
      FieldSchema.strict('b'),
      FieldSchema.forbid('c', 'Do not use c. Use b')
    ])
  );

  check('test.4', {
    urls: [
      { url: 'hi', fresh: 'true' },
      { url: 'hi', fresh: 'true' }
    ]
  }, ValueSchema.objOf([
    FieldSchema.strictArrayOfObj('urls', [
      FieldSchema.strict('url'),
      FieldSchema.defaulted('fresh', '10')
    ])
  ]));

  check('strictArrayOf test',
    { values: [ 'a', 'b' ] },
    ValueSchema.objOf([ FieldSchema.strictArrayOf('values', ValueSchema.string) ])
  );

  checkErr(
    'strictArrayOf should fail since types are not the same',
    'string but got: number',
    { values: [ 'a', 3 ] },
    ValueSchema.objOf([ FieldSchema.strictArrayOf('values', ValueSchema.string) ])
  );

  checkErr('test.6 should fail because fields do not both start with f',
    'start-with-f',
    {
      fieldA: { val: 'a' },
      cieldB: { val: 'b' }
    }, ValueSchema.setOf(function (key) {
      return key.indexOf('f') > -1 ? Result.value(key) : Result.error('start-with-f error');
    }, ValueSchema.objOf([
      FieldSchema.strict('val')
    ]))
  );

  checkErr('test.6b should fail because values do not contain "val"',
    'val',
    {
      fieldA: { val2: 'a' },
      fieldB: { val2: 'b' }
    }, ValueSchema.setOf(Result.value, ValueSchema.objOf([
      FieldSchema.strict('val')
    ]))
  );

  check('test.7',
    {
      fieldA: { val: 'a' },
      fieldB: { val: 'b' }
    }, ValueSchema.setOf(Result.value, ValueSchema.objOf([
      FieldSchema.strict('val')
    ]))
  );

  check('test.8',
    {
      prop: {
        merged: true,
        other: 'yes'
      }
    }, ValueSchema.objOf([
      FieldSchema.field('prop', 'prop', FieldPresence.mergeWith({ merged: true }), ValueSchema.anyValue())
    ])
  );

  checkIs('test.9 (defaulted thunk) with no value supplied',
    {
      name: 'Dr Jekyll'
    },
    {
      surname: 'Jekyll'
    }, ValueSchema.objOf([
      FieldSchema.field('name', 'name', FieldPresence.defaultedThunk(function (s) {
        return 'Dr ' + s.surname;
      }), ValueSchema.anyValue())
    ])
  );

  checkIs('test.10 (defaulted thunk) with value supplied',
    {
      name: 'Hyde'
    },
    {
      name: 'Hyde'
    }, ValueSchema.objOf([
      FieldSchema.field('name', 'name', FieldPresence.defaultedThunk(function (s) {
        return 'Dr ' + s.surname;
      }), ValueSchema.anyValue())
    ])
  );

  Logger.sync('option, value not supplied', function () {
    const v = ValueSchema.asRawOrDie('test.option', ValueSchema.objOf([
      FieldSchema.option('alpha')
    ]), {});
    KAssert.eqNone('alpha should be none', v.alpha);
  });

  Logger.sync('option, value supplied', function () {
    const v = ValueSchema.asRawOrDie('test.option', ValueSchema.objOf([
      FieldSchema.option('alpha')
    ]), { alpha: 'beta' });
    KAssert.eqSome('alpha should be some(beta)', 'beta', v.alpha);
  });

  Logger.sync('defaulted option(fallback), value supplied', function () {
    const v = ValueSchema.asRawOrDie('test.option', ValueSchema.objOf([
      FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOption('fallback'), ValueSchema.anyValue())
    ]), { alpha: 'beta' });
    KAssert.eqSome('fallback.opt: alpha:beta should be some(beta)', 'beta', v.alpha);
  });

  Logger.sync('defaulted option(fallback), value supplied as true', function () {
    const v = ValueSchema.asRawOrDie('test.option', ValueSchema.objOf([
      FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOption('fallback'), ValueSchema.anyValue())
    ]), { alpha: true });
    KAssert.eqSome('fallback.opt: alpha:true should be some(fallback)', 'fallback', v.alpha);
  });

  Logger.sync('defaulted option(fallback), value not supplied', function () {
    const v = ValueSchema.asRawOrDie('test.option', ValueSchema.objOf([
      FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOption('fallback'), ValueSchema.anyValue())
    ]), { });
    KAssert.eqNone('fallback.opt: no alpha should be none', v.alpha);
  });

  Logger.sync('asDefaultedOptionThunk not supplied', function () {
    const v = ValueSchema.asRawOrDie(
      'test.option',
      ValueSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOptionThunk(function (s) {
          return s.label + '.' + 'fallback';
        }), ValueSchema.anyValue())
      ]),
      { label: 'defaulted thunk' }
    );
    KAssert.eqNone('fallback.opt: no alpha should be none', v.alpha);
  });

  Logger.sync('asDefaultedOptionThunk supplied as true', function () {
    const v = ValueSchema.asRawOrDie(
      'test.option',
      ValueSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOptionThunk(function (s) {
          return s.label + '.' + 'fallback';
        }), ValueSchema.anyValue())
      ]),
      { label: 'defaulted thunk', alpha: true }
    );
    KAssert.eqSome('Checking output', 'defaulted thunk.fallback', v.alpha);
  });

  Logger.sync('asDefaultedOptionThunk supplied', function () {
    const v = ValueSchema.asRawOrDie(
      'test.option',
      ValueSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOptionThunk(function (s) {
          return s.label + '.' + 'fallback';
        }), ValueSchema.anyValue())
      ]),
      { label: 'defaulted thunk', alpha: 'alpha.value' }
    );
    KAssert.eqSome('Checking output', 'alpha.value', v.alpha);
  });

  Logger.sync('mergeWithThunk({ extra: s.label }), value supplied', function () {
    const v = ValueSchema.asRawOrDie(
      'test.mergeWith',
      ValueSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.mergeWithThunk(function (s) {
          return Objects.wrap('extra', s.label);
        }), ValueSchema.anyValue())
      ]),
      {
        alpha: {
          original: 'value'
        },
        label: 'dog'
      }
    );
    Assert.eq('Checking output', { original: 'value', extra: 'dog' }, v.alpha);
  });

  Logger.sync('mergeWithThunk({ extra: s.label }), no value supplied', function () {
    const v = ValueSchema.asRawOrDie(
      'test.mergeWith',
      ValueSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.mergeWithThunk(function (s) {
          return Objects.wrap('extra', s.label);
        }), ValueSchema.anyValue())
      ]),
      {
        label: 'dog'
      }
    );
    Assert.eq('Checking output', { extra: 'dog' }, v.alpha);
  });

  Logger.sync(
    'Checking choose',
    function () {

      const processor = ValueSchema.choose(
        'type',
        {
          general: [
            FieldSchema.strict('cards')
          ],
          other: [
            FieldSchema.strict('houses')
          ]
        }
      );

      checkIs(
        'Checking choose(other)',
        { houses: '10' },
        {
          type: 'other',
          houses: '10'
        },
        processor
      );

      checkErr(
        'Checking choose(other) without everything',
        'Could not find valid *strict* value for "houses"',
        {
          type: 'other',
          house: '10'
        },
        processor
      );

      checkErr(
        'Checking choose(other) without wrong schema',
        'Could not find valid *strict* value for "houses"',
        {
          type: 'other',
          cards: '10'
        },
        processor
      );

      checkIs(
        'Checking choose(general)',
        { cards: '10' },
        {
          type: 'general',
          cards: '10'
        },
        processor
      );

      checkErr(
        'Checking choose(general) without everything',
        'Could not find valid *strict* value for "cards"',
        {
          type: 'general',
          mech: '10'
        },
        processor
      );

      checkErr(
        'Checking choose(general) with wrong schema',
        'Could not find valid *strict* value for "cards"',
        {
          type: 'general',
          houses: '10'
        },
        processor
      );

      checkErr(
        'Checking choose(dog)',
        'chosen schema: "dog" did not exist',
        {
          type: 'dog',
          houses: '10'
        },
        processor
      );

    }
  );

  Logger.sync('Checking basic types', function () {
    checkIs('Checking valid number', 42, 42, ValueSchema.number);
    checkErr('Checking invalid number', 'Expected type: number but got: string', 'a', ValueSchema.number);

    checkIs('Checking valid string', 'a', 'a', ValueSchema.string);
    checkErr('Checking invalid string', 'Expected type: string but got: number', 42, ValueSchema.string);

    checkIs('Checking valid boolean', true, true, ValueSchema.boolean);
    checkErr('Checking invalid boolean', 'Expected type: boolean but got: string', 'a', ValueSchema.boolean);

    checkIs('Checking valid function', Fun.noop, Fun.noop, ValueSchema.func);
    checkErr('Checking invalid function', 'Expected type: function but got: string', 'a', ValueSchema.func);
  });

  Logger.sync('asRaw with type', function () {
    interface SomeType {
      num: number;
      str: string;
    }

    const schema = ValueSchema.objOf([
      FieldSchema.strictOf('num', ValueSchema.number),
      FieldSchema.strictOf('str', ValueSchema.string)
    ]);

    ValueSchema.asRaw<SomeType>('SomeType', schema, {
      num: 42,
      str: 'a'
    }).fold(
      () => assert.fail('Should not fail'),
      (actual) => Assert.eq('Should be expected object', {
        num: 42,
        str: 'a'
      }, actual)
    );

    ValueSchema.asRaw<SomeType>('SomeType', schema, {}).fold(
      (err) => Assert.eq('Should be two errors', 2, err.errors.length),
      () => assert.fail('Should not pass')
    );
  });

  Logger.sync('Checking oneOf', () => {
    const processor = ValueSchema.oneOf([
      ValueSchema.string,
      ValueSchema.number
    ]);

    check('oneOf ',
      'a',
      processor
    );

    check('oneOf',
      1,
      processor
    );

    checkErr('oneOf',
      'Failed path: (oneOf)\n' +
      'Expected type: string but got: object\n' +
      'Failed path: (oneOf)\n' +
      'Expected type: number but got: object',
      {},
      processor
    );
  });
});
