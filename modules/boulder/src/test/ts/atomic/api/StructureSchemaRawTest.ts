import { Logger } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Result } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import * as FieldPresence from 'ephox/boulder/api/FieldPresence';
import * as FieldSchema from 'ephox/boulder/api/FieldSchema';
import * as Objects from 'ephox/boulder/api/Objects';
import * as StructureSchema from 'ephox/boulder/api/StructureSchema';
import { StructureProcessor } from 'ephox/boulder/core/StructureProcessor';
import * as ValueType from 'ephox/boulder/core/ValueType';

UnitTest.test('StructureSchemaRawTest', () => {
  const checkErr = (label: string, expectedPart: string, input: any, processor: StructureProcessor) => {
    StructureSchema.asRaw(label, processor, input).fold((err) => {
      const message = StructureSchema.formatError(err);
      Assert.eq(label + '. Was looking to see if contained: ' + expectedPart + '.\nWas: ' + message, true, message.indexOf(expectedPart) > -1);
    }, (val) => {
      Assert.fail(label + '\nExpected error: ' + expectedPart + '\nWas success(' + JSON.stringify(val, null, 2) + ')');
    });
  };

  const check = (label: string, input: any, processor: StructureProcessor) => {
    const actual = StructureSchema.asRawOrDie(label, processor, input);
    Assert.eq(label, input, actual);
  };

  const checkIs = (label: string, expected: any, input: any, processor: StructureProcessor) => {
    const actual = StructureSchema.asRawOrDie(label, processor, input);
    Assert.eq(label, expected, actual);
  };

  check('test.1', 10, ValueType.anyValue());

  check('test.2', [ 10, 20, 50 ], StructureSchema.arrOfVal());

  check('test.3', {
    a: 'a',
    b: 'b'
  }, StructureSchema.objOf([
    FieldSchema.required('a'),
    FieldSchema.required('b')
  ]));

  checkIs('test.3 (with extra)', {
    a: 'a',
    b: 'b'
  }, {
    a: 'a',
    b: 'b',
    c: 'c'
  }, StructureSchema.objOf([
    FieldSchema.required('a'),
    FieldSchema.required('b')
  ]));

  checkErr(
    'test.3 (with extra and only) and two fields',
    'unsupported fields: [c]',
    {
      a: 'a',
      b: 'b',
      c: 'c'
    },
    StructureSchema.objOfOnly([
      FieldSchema.required('a'),
      FieldSchema.required('b')
    ])
  );

  checkErr(
    'test.3 (with extra and only) and no fields',
    'unsupported fields: [aa]',
    {
      aa: 'aa'
    },
    StructureSchema.objOfOnly([

    ])
  );

  check(
    'test.3 with no forbidden field',
    {
      a: 'a',
      b: 'b'
    },
    StructureSchema.objOfOnly([
      FieldSchema.required('a'),
      FieldSchema.required('b')
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
    StructureSchema.objOf([
      FieldSchema.required('a'),
      FieldSchema.required('b'),
      FieldSchema.forbid('c', 'Do not use c. Use b')
    ])
  );

  check('test.4', {
    urls: [
      { url: 'hi', fresh: 'true' },
      { url: 'hi', fresh: 'true' }
    ]
  }, StructureSchema.objOf([
    FieldSchema.requiredArrayOfObj('urls', [
      FieldSchema.required('url'),
      FieldSchema.defaulted('fresh', '10')
    ])
  ]));

  check('requiredArrayOf test',
    { values: [ 'a', 'b' ] },
    StructureSchema.objOf([ FieldSchema.requiredArrayOf('values', ValueType.string) ])
  );

  checkErr(
    'requiredArrayOf should fail since types are not the same',
    'string but got: number',
    { values: [ 'a', 3 ] },
    StructureSchema.objOf([ FieldSchema.requiredArrayOf('values', ValueType.string) ])
  );

  checkErr('test.6 should fail because fields do not both start with f',
    'start-with-f',
    {
      fieldA: { val: 'a' },
      cieldB: { val: 'b' }
    }, StructureSchema.setOf((key) => {
      return key.indexOf('f') > -1 ? Result.value(key) : Result.error('start-with-f error');
    }, StructureSchema.objOf([
      FieldSchema.required('val')
    ]))
  );

  checkErr('test.6b should fail because values do not contain "val"',
    'val',
    {
      fieldA: { val2: 'a' },
      fieldB: { val2: 'b' }
    }, StructureSchema.setOf(Result.value, StructureSchema.objOf([
      FieldSchema.required('val')
    ]))
  );

  check('test.7',
    {
      fieldA: { val: 'a' },
      fieldB: { val: 'b' }
    }, StructureSchema.setOf(Result.value, StructureSchema.objOf([
      FieldSchema.required('val')
    ]))
  );

  check('test.8',
    {
      prop: {
        merged: true,
        other: 'yes'
      }
    }, StructureSchema.objOf([
      FieldSchema.field('prop', 'prop', FieldPresence.mergeWith({ merged: true }), ValueType.anyValue())
    ])
  );

  checkIs('test.9 (defaulted thunk) with no value supplied',
    {
      name: 'Dr Jekyll'
    },
    {
      surname: 'Jekyll'
    }, StructureSchema.objOf([
      FieldSchema.field('name', 'name', FieldPresence.defaultedThunk((s) => {
        return 'Dr ' + s.surname;
      }), ValueType.anyValue())
    ])
  );

  checkIs('test.10 (defaulted thunk) with value supplied',
    {
      name: 'Hyde'
    },
    {
      name: 'Hyde'
    }, StructureSchema.objOf([
      FieldSchema.field('name', 'name', FieldPresence.defaultedThunk((s) => {
        return 'Dr ' + s.surname;
      }), ValueType.anyValue())
    ])
  );

  Logger.sync('option, value not supplied', () => {
    const v = StructureSchema.asRawOrDie('test.option', StructureSchema.objOf([
      FieldSchema.option('alpha')
    ]), {});
    KAssert.eqNone('alpha should be none', v.alpha);
  });

  Logger.sync('option, value supplied', () => {
    const v = StructureSchema.asRawOrDie('test.option', StructureSchema.objOf([
      FieldSchema.option('alpha')
    ]), { alpha: 'beta' });
    KAssert.eqSome('alpha should be some(beta)', 'beta', v.alpha);
  });

  Logger.sync('defaulted option(fallback), value supplied', () => {
    const v = StructureSchema.asRawOrDie('test.option', StructureSchema.objOf([
      FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOption('fallback'), ValueType.anyValue())
    ]), { alpha: 'beta' });
    KAssert.eqSome('fallback.opt: alpha:beta should be some(beta)', 'beta', v.alpha);
  });

  Logger.sync('defaulted option(fallback), value supplied as true', () => {
    const v = StructureSchema.asRawOrDie('test.option', StructureSchema.objOf([
      FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOption('fallback'), ValueType.anyValue())
    ]), { alpha: true });
    KAssert.eqSome('fallback.opt: alpha:true should be some(fallback)', 'fallback', v.alpha);
  });

  Logger.sync('defaulted option(fallback), value not supplied', () => {
    const v = StructureSchema.asRawOrDie('test.option', StructureSchema.objOf([
      FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOption('fallback'), ValueType.anyValue())
    ]), { });
    KAssert.eqNone('fallback.opt: no alpha should be none', v.alpha);
  });

  Logger.sync('asDefaultedOptionThunk not supplied', () => {
    const v = StructureSchema.asRawOrDie(
      'test.option',
      StructureSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOptionThunk((s) => {
          return s.label + '.' + 'fallback';
        }), ValueType.anyValue())
      ]),
      { label: 'defaulted thunk' }
    );
    KAssert.eqNone('fallback.opt: no alpha should be none', v.alpha);
  });

  Logger.sync('asDefaultedOptionThunk supplied as true', () => {
    const v = StructureSchema.asRawOrDie(
      'test.option',
      StructureSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOptionThunk((s) => {
          return s.label + '.' + 'fallback';
        }), ValueType.anyValue())
      ]),
      { label: 'defaulted thunk', alpha: true }
    );
    KAssert.eqSome('Checking output', 'defaulted thunk.fallback', v.alpha);
  });

  Logger.sync('asDefaultedOptionThunk supplied', () => {
    const v = StructureSchema.asRawOrDie(
      'test.option',
      StructureSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.asDefaultedOptionThunk((s) => {
          return s.label + '.' + 'fallback';
        }), ValueType.anyValue())
      ]),
      { label: 'defaulted thunk', alpha: 'alpha.value' }
    );
    KAssert.eqSome('Checking output', 'alpha.value', v.alpha);
  });

  Logger.sync('mergeWithThunk({ extra: s.label }), value supplied', () => {
    const v = StructureSchema.asRawOrDie(
      'test.mergeWith',
      StructureSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.mergeWithThunk((s) => {
          return Objects.wrap('extra', s.label);
        }), ValueType.anyValue())
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

  Logger.sync('mergeWithThunk({ extra: s.label }), no value supplied', () => {
    const v = StructureSchema.asRawOrDie(
      'test.mergeWith',
      StructureSchema.objOf([
        FieldSchema.field('alpha', 'alpha', FieldPresence.mergeWithThunk((s) => {
          return Objects.wrap('extra', s.label);
        }), ValueType.anyValue())
      ]),
      {
        label: 'dog'
      }
    );
    Assert.eq('Checking output', { extra: 'dog' }, v.alpha);
  });

  Logger.sync(
    'Checking choose',
    () => {

      const processor = StructureSchema.choose(
        'type',
        {
          general: [
            FieldSchema.required('cards')
          ],
          other: [
            FieldSchema.required('houses')
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
        'Could not find valid *required* value for "houses"',
        {
          type: 'other',
          house: '10'
        },
        processor
      );

      checkErr(
        'Checking choose(other) without wrong schema',
        'Could not find valid *required* value for "houses"',
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
        'Could not find valid *required* value for "cards"',
        {
          type: 'general',
          mech: '10'
        },
        processor
      );

      checkErr(
        'Checking choose(general) with wrong schema',
        'Could not find valid *required* value for "cards"',
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

  Logger.sync('Checking basic types', () => {
    checkIs('Checking valid number', 42, 42, ValueType.number);
    checkErr('Checking invalid number', 'Expected type: number but got: string', 'a', ValueType.number);

    checkIs('Checking valid string', 'a', 'a', ValueType.string);
    checkErr('Checking invalid string', 'Expected type: string but got: number', 42, ValueType.string);

    checkIs('Checking valid boolean', true, true, ValueType.boolean);
    checkErr('Checking invalid boolean', 'Expected type: boolean but got: string', 'a', ValueType.boolean);

    checkIs('Checking valid function', Fun.noop, Fun.noop, ValueType.func);
    checkErr('Checking invalid function', 'Expected type: function but got: string', 'a', ValueType.func);
  });

  Logger.sync('asRaw with type', () => {
    interface SomeType {
      num: number;
      str: string;
    }

    const schema = StructureSchema.objOf([
      FieldSchema.requiredOf('num', ValueType.number),
      FieldSchema.requiredOf('str', ValueType.string)
    ]);

    StructureSchema.asRaw<SomeType>('SomeType', schema, {
      num: 42,
      str: 'a'
    }).fold(
      () => Assert.fail('Should not fail'),
      (actual) => Assert.eq('Should be expected object', {
        num: 42,
        str: 'a'
      }, actual)
    );

    StructureSchema.asRaw<SomeType>('SomeType', schema, {}).fold(
      (err) => Assert.eq('Should be two errors', 2, err.errors.length),
      () => Assert.fail('Should not pass')
    );
  });

  Logger.sync('Checking oneOf', () => {
    const processor = StructureSchema.oneOf([
      ValueType.string,
      ValueType.number
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
