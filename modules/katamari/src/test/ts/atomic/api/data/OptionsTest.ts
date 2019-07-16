import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import * as Options from 'ephox/katamari/api/Options';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('OptionsTest', function () {
  const person = function (name, age, address) {
    return { name, age, address };
  };

  assert.eq({name: 'bob', age: 25, address: 'the moon'}, Options.liftN([Option.some('bob'), Option.some(25), Option.some('the moon')], person).getOrDie());

  assert.eq(true, Options.liftN([Option.some('bob'), Option.none(), Option.some('the moon')], function () { throw new Error('barf'); }).isNone());
  assert.eq(true, Options.liftN([Option.none(), Option.none(), Option.some('the moon')], function () { throw new Error('barf'); }).isNone());

  const arr1 = [Option.some(1), Option.none(), Option.some(2), Option.some(3), Option.none(), Option.none(), Option.none(), Option.none(), Option.some(4)];
  assert.eq([1, 2, 3, 4], Options.cat(arr1));

  assert.eq(undefined, Option.some(1).each(Fun.identity), 'each returns undefined');
  assert.eq(undefined, Option.none().each(Fun.identity), 'each returns undefined');

  Jsc.property(
    'Options.cat of only nones should be an empty array',
    Jsc.array(ArbDataTypes.optionNone),
    function (options) {
      const output = Options.cat(options);
      return Jsc.eq(0, output.length);
    }
  );

  Jsc.property(
    'Options.cat of only somes should have the same length',
    Jsc.array(ArbDataTypes.optionSome),
    function (options) {
      const output = Options.cat(options);
      return Jsc.eq(options.length, output.length);
    }
  );

  Jsc.property(
    'Options.cat of Arr.map(xs, Option.some) should be xs',
    Jsc.array(Jsc.json),
    function (arr) {
      const options = Arr.map(arr, Option.some);
      const output = Options.cat(options);
      return Jsc.eq(arr, output);
    }
  );

  Jsc.property(
    'Options.cat of somes and nones should have length <= original',
    Jsc.array(ArbDataTypes.option),
    function (arr) {
      const output = Options.cat(arr);
      return Jsc.eq(output.length <= arr.length, true);
    }
  );

  Jsc.property(
    'Options.cat of nones.concat(somes).concat(nones) should be somes',
    Jsc.array(Jsc.json),
    Jsc.array(Jsc.json),
    Jsc.array(Jsc.json),
    function (before, on, after) {
      const beforeNones = Arr.map(before, Option.none);
      const afterNones = Arr.map(after, Option.none);
      const onSomes = Arr.map(on, Option.some);
      const output = Options.cat(beforeNones.concat(onSomes).concat(afterNones));
      return Jsc.eq(on, output);
    }
  );

  Jsc.property(
    'Options.findMap of empty is none',
    Jsc.fun(ArbDataTypes.option),
    function (f) {
      return Jsc.eq(true, Options.findMap([ ], f).isNone());
    }
  );

  Jsc.property(
    'Options.findMap of non-empty is first if f is Option.some',
    Jsc.nearray(Jsc.json),
    function (arr) {
      return Jsc.eq(arr[0], Options.findMap(arr, Option.some).getOrDie());
    }
  );

  Jsc.property(
    'Options.findMap of non-empty is none if f is Option.none',
    Jsc.nearray(Jsc.json),
    function (arr) {
      return Jsc.eq(true, Options.findMap(arr, Option.none).isNone());
    }
  );

  Jsc.property(
    'Options.findMap always returns an option',
    Jsc.nearray(Jsc.json),
    Jsc.fun(ArbDataTypes.option),
    function (arr, f) {
      const output = Options.findMap(arr, f);
      return output.isNone() || output.isSome();
    }
  );

  Jsc.property(
    'Options.liftN of an array of nones returns a none',
    Jsc.nearray(ArbDataTypes.optionNone),
    function (arr) {
      const output = Options.liftN(arr, Fun.die('Never executes f'));
      return output.isNone();
    }
  );

  Jsc.property(
    'Options.liftN of an array of somes returns a some',
    Jsc.nearray(ArbDataTypes.optionSome),
    Jsc.fun(Jsc.json),
    function (arr, f) {
      const output = Options.liftN(arr, f);
      return output.isSome();
    }
  );

  Jsc.property(
    'Options.liftN of an array mirrors cat',
    Jsc.nearray(ArbDataTypes.option),
    Jsc.fun(Jsc.json),
    function (arr, f) {
      const args = Options.cat(arr);
      const output = Options.liftN(arr, f);

      if (args.length === arr.length) {
        return Jsc.eq(output.getOrDie(), f.apply(undefined, args));
      } else {
        return output.isNone();
      }
    }
  );

  Jsc.property(
    'Options.lift with two arguments mirrors cat with two items',
    ArbDataTypes.option,
    ArbDataTypes.option,
    Jsc.fun(Jsc.json),
    function (a, b, f) {
      const args = Options.cat([a, b]);
      const output = Options.lift(a, b, f);

      if (args.length === 2) {
        return Jsc.eq(output.getOrDie(), f.apply(undefined, args));
      } else {
        return output.isNone();
      }
    }
  );
});
