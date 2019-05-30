import { assert, UnitTest } from '@ephox/bedrock';
import { Arr, Obj, Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import Jsc from '@ephox/wrap-jsverify';
import * as Objects from 'ephox/boulder/api/Objects';

UnitTest.test('ObjectsTest', function () {
  const smallSet = Jsc.nestring;

  const check = function (label, arb, checker) {
    Jsc.syncProperty(label, [ arb ], checker, { });
  };

  const testNarrow = function () {
    const narrowGen = Jsc.bless({
      generator: Jsc.dict(smallSet).generator.flatMap(function (obj) {
        const keys = Obj.keys(obj);
        return keys.length === 0 ? Jsc.constant( { obj, fields: [ ] }).generator : Jsc.array(Jsc.elements(keys)).generator.map(function (fields) {
          return {
            obj,
            fields
          };
        });
      })
    });

    check('Testing narrow', narrowGen, function (input) {
      const narrowed = Objects.narrow(input.obj, input.fields);
      Obj.each(narrowed, function (_, k) {
        if (!Arr.contains(input.fields, k)) { throw new Error('Narrowed object contained property: ' + k + ' which was not in fields: [' + input.fields.join(', ') + ']'); }
      });
      return true;
    });

    // Sanity test.
    const actual = Objects.narrow({ a: 'a', b: 'b', c: 'c' }, [ 'a', 'c', 'e' ]);
    assert.eq({ a: 'a', c: 'c' }, actual);
  };

  const testExclude = function () {
    const excludeGen = Jsc.bless({
      generator: Jsc.dict(smallSet).generator.flatMap(function (obj) {
        const keys = Obj.keys(obj);
        return keys.length === 0 ? Jsc.constant( { obj, fields: [ ] }).generator : Jsc.array(Jsc.elements(keys)).generator.map(function (fields) {
          return {
            obj,
            fields
          };
        });
      })
    });

    check('Testing exclude', excludeGen, function (input) {
      const excluded = Objects.exclude(input.obj, input.fields);
      Obj.each(excluded, function (_, k) {
        if (Arr.contains(input.fields, k)) { throw new Error('Excluded object contained property: ' + ' which should have been excluded by: [' +
          input.fields.join(', ') + ']');
        }
      });
      return true;
    });

    const actual = Objects.exclude({ a: 'a', b: 'b', c: 'c' }, [ 'b' ]);
    assert.eq({ a: 'a', c: 'c' }, actual);
  };

  const testReaders = function () {
    // TODO: Think of a good way to property test.
    const subject = { alpha: 'Alpha' };

    assert.eq('Alpha', Objects.readOpt('alpha')(subject).getOrDie('readOpt(alpha) => some(Alpha)'), 'readOpt(alpha) => some(Alpha)');
    assert.eq(true, Objects.readOpt('beta')(subject).isNone(), 'readOpt(beta) => none');

    assert.eq('Alpha', Objects.readOr('alpha', 'fallback')(subject), 'readOr(alpha) => Alpha');
    assert.eq('fallback', Objects.readOr('beta', 'fallback')(subject), 'readOr(beta) => fallback');

    assert.eq('Alpha', Objects.readOptFrom(subject, 'alpha').getOrDie('readOptFrom(alpha) => some(Alpha)'), 'readOptFrom(alpha) => some(Alpha)');
    assert.eq(true, Objects.readOptFrom(subject, 'beta').isNone(), 'readOptFrom(beta) => none');
  };

  const testConsolidate = function () {
    const checkErr = function (label, expected, objs, base) {
      Objects.consolidate(objs, base).fold(function (err) {
        assert.eq(expected, err);
      }, function (val) {
        assert.fail(label + '\nExpected error(' + Json.stringify(expected) + '), but was: ' + Json.stringify(val));
      });
    };

    const checkVal = function (label, expected, objs, base) {
      Objects.consolidate(objs, base).fold(function (err) {
        assert.fail(label + '\nExpected value(' + Json.stringify(expected) + '), but was error(' + Json.stringify(err) + ')');
      }, function (val) {
        assert.eq(expected, val);
      });
    };

    checkVal(
      'empty objects',
      { },
      [ ], {}
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
      { a: 'A' , b: 'B', c: 'C'},
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
      generator: Jsc.dict(smallSet).generator.flatMap(function (obj) {
        return Jsc.bool.generator.flatMap(function (flag) {
          return flag ? Jsc.constant(Result.value(obj)).generator : (function () {
            return Jsc.array(Jsc.nestring).generator.map(Result.error);
          })();
        });
      })
    });

    const inputList = Jsc.bless({
      generator: Jsc.array(resultList).generator.flatMap(function (results) {
        return Jsc.dict(smallSet).generator.map(function (base) {
          return {
            results,
            base
          };
        });
      })
    });

    check('Testing consolidate', inputList, function (input) {
      const actual = Objects.consolidate(input.results, input.base);

      const hasError = Arr.exists(input.results, function (res) {
        return res.isError();
      });

      if (hasError) { assert.eq(true, actual.isError(), 'Error contained in list, so should be error overall'); } else { assert.eq(true, actual.isValue(), 'No errors in list, so should be value overall'); }
      return true;
    });

    Jsc.syncProperty(
      'Testing consolidate with base',
      [ inputList, Jsc.nestring, Jsc.json ],
      function (input, baseKey: string, baseValue) {
        const actual = Objects.consolidate(input.results, Objects.wrap(baseKey, baseValue));
        const hasError = Arr.exists(input.results, function (res) {
          return res.isError();
        });

        if (hasError) { return Jsc.eq(true, actual.isError()) ? true : 'Error contained in list, so should be error overall'; } else {
          assert.eq(true, actual.isValue(), 'No errors in list, so should be value overall');
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
