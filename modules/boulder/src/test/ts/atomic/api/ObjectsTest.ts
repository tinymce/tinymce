import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj, Result } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';
import * as Objects from 'ephox/boulder/api/Objects';

import { KAssert } from '@ephox/katamari-assertions';

UnitTest.test('ObjectsTest', () => {
  const smallSet = Jsc.nestring;

  const check = (label, arb, checker) => {
    Jsc.syncProperty(label, [ arb ], checker, {});
  };

  const testNarrow = () => {
    const narrowGen = Jsc.bless({
      generator: Jsc.dict(smallSet).generator.flatMap((obj) => {
        const keys = Obj.keys(obj);
        return keys.length === 0 ? Jsc.constant({
          obj,
          fields: []
        }).generator : Jsc.array(Jsc.elements(keys)).generator.map((fields) => ({
          obj,
          fields
        }));
      })
    });

    check('Testing narrow', narrowGen, (input) => {
      const narrowed = Objects.narrow(input.obj, input.fields);
      Obj.each(narrowed, (_, k) => {
        if (!Arr.contains(input.fields, k)) {
          throw new Error('Narrowed object contained property: ' + k + ' which was not in fields: [' + input.fields.join(', ') + ']');
        }
      });
      return true;
    });

    // Sanity test.
    const actual = Objects.narrow({ a: 'a', b: 'b', c: 'c' }, [ 'a', 'c', 'e' ]);
    Assert.eq('eq', { a: 'a', c: 'c' }, actual);
  };

  const testExclude = () => {
    const excludeGen = Jsc.bless({
      generator: Jsc.dict(smallSet).generator.flatMap((obj) => {
        const keys = Obj.keys(obj);
        return keys.length === 0 ? Jsc.constant({
          obj,
          fields: []
        }).generator : Jsc.array(Jsc.elements(keys)).generator.map((fields) => ({
          obj,
          fields
        }));
      })
    });

    check('Testing exclude', excludeGen, (input) => {
      const excluded = Objects.exclude(input.obj, input.fields);
      Obj.each(excluded, (_, k) => {
        if (Arr.contains(input.fields, k)) {
          throw new Error('Excluded object contained property: ' + ' which should have been excluded by: [' +
            input.fields.join(', ') + ']');
        }
      });
      return true;
    });

    const actual = Objects.exclude({ a: 'a', b: 'b', c: 'c' }, [ 'b' ]);
    Assert.eq('eq', { a: 'a', c: 'c' }, actual);
  };

  const testReaders = () => {
    // TODO: Think of a good way to property test.
    const subject = { alpha: 'Alpha' };

    KAssert.eqSome('readOptFrom(alpha) => some(Alpha)', 'Alpha', Obj.get(subject, 'alpha'));
  };

  const testConsolidate = () => {
    const checkErr = (label, expected, objs, base) => {
      KAssert.eqError('eq', expected, Objects.consolidate(objs, base));
    };

    const checkVal = (label, expected, objs, base) => {
      KAssert.eqValue('eq', expected, Objects.consolidate(objs, base));
    };

    checkVal(
      'empty objects',
      {},
      [], {}
    );

    checkErr(
      '[ failure ] ]',
      [ 'failure.1' ],
      [
        Result.error([ 'failure.1' ])
      ], {}
    );

    checkErr(
      '[ failure {1,2,3} ]',
      [ 'failure.1', 'failure.2', 'failure.3' ],
      [
        Result.error([ 'failure.1' ]),
        Result.error([ 'failure.2' ]),
        Result.error([ 'failure.3' ])
      ], {}
    );

    checkVal(
      '[ value.a ]',
      { a: 'A' },
      [
        Result.value({ a: 'A' })
      ], {}
    );

    checkVal(
      '[ value.{a,b,c} ]',
      { a: 'A', b: 'B', c: 'C' },
      [
        Result.value({ a: 'A' }),
        Result.value({ b: 'B' }),
        Result.value({ c: 'C' })
      ], {}
    );

    checkErr(
      '[ value.a, failure.1, value.b ]',
      [ 'failure.1' ],
      [
        Result.value({ a: 'A' }),
        Result.error([ 'failure.1' ]),
        Result.value({ b: 'B' })
      ], {}
    );

    checkErr(
      '[ value.a, failure.1, value.b, failure.2, failure.3 ]',
      [ 'failure.1', 'failure.2', 'failure.3' ],
      [
        Result.value({ a: 'A' }),
        Result.error([ 'failure.1' ]),
        Result.value({ b: 'B' }),
        Result.error([ 'failure.2' ]),
        Result.error([ 'failure.3' ])
      ], {}
    );

    checkErr(
      '[ value.{a,b,c} ]',
      [ 'failure.last' ],
      [
        Result.value({ a: 'A' }),
        Result.value({ b: 'B' }),
        Result.value({ c: 'C' }),
        Result.error([ 'failure.last' ])
      ], {}
    );

    // some property-based tests
    const resultList = Jsc.bless({
      generator: Jsc.dict(smallSet).generator.flatMap((obj) => Jsc.bool.generator.flatMap((flag) => flag ? Jsc.constant(Result.value(obj)).generator : (() => Jsc.array(Jsc.nestring).generator.map(Result.error))()))
    });

    const inputList = Jsc.bless({
      generator: Jsc.array(resultList).generator.flatMap((results) => Jsc.dict(smallSet).generator.map((base) => ({
        results,
        base
      })))
    });

    check('Testing consolidate', inputList, (input) => {
      const actual = Objects.consolidate(input.results, input.base);

      const hasError = Arr.exists(input.results, (res) => res.isError());

      if (hasError) {
        Assert.eq('Error contained in list, so should be error overall', true, actual.isError());
      } else {
        Assert.eq('No errors in list, so should be value overall', true, actual.isValue());
      }
      return true;
    });

    Jsc.syncProperty(
      'Testing consolidate with base',
      [ inputList, Jsc.nestring, Jsc.json ],
      (input, baseKey: string, baseValue) => {
        const actual = Objects.consolidate(input.results, Objects.wrap(baseKey, baseValue));
        const hasError = Arr.exists(input.results, (res) => res.isError());

        if (hasError) {
          return Jsc.eq(true, actual.isError()) ? true : 'Error contained in list, so should be error overall';
        } else {
          Assert.eq('No errors in list, so should be value overall', true, actual.isValue());
          return Jsc.eq(true, Obj.has(actual.getOrDie() as any, baseKey)) ? true : 'Missing base key: ' + baseKey;
        }
      }
    );
  };

  testNarrow();
  testExclude();
  testReaders();
  testConsolidate();
});
