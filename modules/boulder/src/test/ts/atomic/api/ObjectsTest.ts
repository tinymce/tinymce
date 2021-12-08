import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj, Result } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import * as fc from 'fast-check';

import * as Objects from 'ephox/boulder/api/Objects';

UnitTest.test('ObjectsTest', () => {
  const smallSet = fc.string({ minLength: 1 });

  const check = <T>(arb: fc.Arbitrary<T>, checker: (value: T) => boolean | void) => {
    fc.assert(fc.property(arb, checker));
  };

  const testNarrow = () => {
    const narrowGen = fc.dictionary(smallSet, smallSet).chain((obj) => {
      const keys = Obj.keys(obj);
      return keys.length === 0 ? fc.constant({
        obj,
        fields: []
      }) : fc.array(fc.constantFrom(...keys)).map((fields) => ({
        obj,
        fields
      }));
    });

    check(narrowGen, (input) => {
      const narrowed = Objects.narrow(input.obj, input.fields);
      Obj.each(narrowed, (_, k) => {
        if (!Arr.contains(input.fields, k)) {
          throw new Error('Narrowed object contained property: ' + k + ' which was not in fields: [' + input.fields.join(', ') + ']');
        }
      });
      return true;
    });

    // Sanity test.
    const actual = Objects.narrow({ a: 'a', b: 'b', c: 'c' }, [ 'a', 'c' ]);
    Assert.eq('eq', { a: 'a', c: 'c' }, actual);
  };

  const testExclude = () => {
    const excludeGen = fc.dictionary(smallSet, smallSet).chain((obj) => {
      const keys = Obj.keys(obj);
      return keys.length === 0 ? fc.constant({
        obj,
        fields: []
      }) : fc.array(fc.constantFrom(...keys)).map((fields) => ({
        obj,
        fields
      }));
    });

    check(excludeGen, (input) => {
      const excluded = Objects.exclude(input.obj, input.fields);
      Obj.each(excluded, (_, k) => {
        if (Arr.contains(input.fields, k)) {
          throw new Error('Excluded object contained property: ' + ' which should have been excluded by: [' +
            input.fields.join(', ') + ']');
        }
      });
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
      KAssert.eqError(`eq ${label}`, expected, Objects.consolidate(objs, base));
    };

    const checkVal = (label, expected, objs, base) => {
      KAssert.eqValue(`eq ${label}`, expected, Objects.consolidate(objs, base));
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
    const resultList = fc.dictionary(smallSet, smallSet).chain((obj) =>
      fc.boolean().chain((flag): fc.Arbitrary<Result<Record<string, string>, string[]>> =>
        flag ? fc.constant(Result.value(obj)) : fc.array(smallSet).map(Result.error)
      )
    );

    const inputList = fc.array(resultList).chain((results) => fc.dictionary(smallSet, smallSet).map((base) => ({
      results,
      base
    })));

    // Testing consolidate
    check(inputList, (input) => {
      const actual = Objects.consolidate(input.results, input.base);

      const hasError = Arr.exists(input.results, (res) => res.isError());

      if (hasError) {
        Assert.eq('Error contained in list, so should be error overall', true, actual.isError());
      } else {
        Assert.eq('No errors in list, so should be value overall', true, actual.isValue());
      }
      return true;
    });

    // Testing consolidate with base
    fc.assert(fc.property(inputList, smallSet, fc.json(), (input, baseKey, baseValue) => {
      const actual = Objects.consolidate(input.results, Objects.wrap(baseKey, baseValue));
      const hasError = Arr.exists(input.results, (res) => res.isError());

      if (hasError) {
        Assert.eq('Error contained in list, so should be error overall', true, actual.isError());
      } else {
        Assert.eq('No errors in list, so should be value overall', true, actual.isValue());
        Assert.eq('Missing base key: ' + baseKey, true, Obj.has(actual.getOrDie(), baseKey));
      }
    }));
  };

  testNarrow();
  testExclude();
  testReaders();
  testConsolidate();
});
