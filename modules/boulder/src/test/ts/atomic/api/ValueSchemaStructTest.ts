import { assert, UnitTest } from '@ephox/bedrock-client';
import * as FieldPresence from 'ephox/boulder/api/FieldPresence';
import * as FieldSchema from 'ephox/boulder/api/FieldSchema';
import * as ValueSchema from 'ephox/boulder/api/ValueSchema';

UnitTest.test('ValueSchemaStuct Test', function () {
  const actualVal = ValueSchema.asStructOrDie('test.struct.val', ValueSchema.anyValue(), 10);
  assert.eq(10, actualVal);

  const actualObj = ValueSchema.asStructOrDie('test.struct.obj', ValueSchema.objOf([
    FieldSchema.strict('a')
  ]), {
    a: 'alpha'
  });
  assert.eq('alpha', actualObj.a());

  const actualArray = ValueSchema.asStructOrDie('test.struct.arr', ValueSchema.arrOf(
    ValueSchema.anyValue()
  ), [ 'a', 'b', 'c' ]);
  assert.eq('c', actualArray[2]);

  const actualArrayOfObj = ValueSchema.asStructOrDie('test.struct.arrof.obj', ValueSchema.arrOf(
    ValueSchema.objOf([
      FieldSchema.strict('a'),
      FieldSchema.strict('b')
    ])
  ), [
    { a: 'alpha', b: 'Beta' }
  ]);
  assert.eq('Beta', actualArrayOfObj[0].b());

  const nestedObj = ValueSchema.asStructOrDie('test.struct.nested.obj', ValueSchema.objOf([
    FieldSchema.field('first', 'first', FieldPresence.strict(), ValueSchema.objOf([
      FieldSchema.strict('first.a')
    ])),
    FieldSchema.strict('second'),
    FieldSchema.field('third', 'third', FieldPresence.defaulted('third.fallback'), ValueSchema.anyValue()),
    FieldSchema.field('fourth', 'fourth', FieldPresence.asOption(), ValueSchema.objOf([
      FieldSchema.strict('fourth.a')
    ]))
  ]), {
    first: {
      'first.a': 'First-a-value'
    },
    second: 'Second',
    fourth: {
      'fourth.a': 'Fourth-a-value'
    }
  });
  assert.eq('First-a-value', nestedObj.first()['first.a']());
  assert.eq('Second', nestedObj.second());
  assert.eq('third.fallback', nestedObj.third());
  assert.eq(true, nestedObj.fourth().isSome());
  assert.eq('Fourth-a-value', nestedObj.fourth().getOrDie()['fourth.a']());

  const actualComplex = ValueSchema.asStructOrDie('test.struct.complex', ValueSchema.objOf([
    FieldSchema.field('countries', 'countries', FieldPresence.strict(), ValueSchema.objOf([
      FieldSchema.field('aus', 'aus', FieldPresence.strict(), ValueSchema.objOf([
        FieldSchema.strict('brisbane'),
        FieldSchema.strict('sydney')
      ]))
    ]))

  ]), {
    countries: {
      aus: {
        brisbane: '19',
        sydney: '20'
      }
    }
  });

  assert.eq(true, actualComplex.countries().aus !== undefined);
  assert.eq('19', actualComplex.countries().aus().brisbane());
  assert.eq('20', actualComplex.countries().aus().sydney());
});
