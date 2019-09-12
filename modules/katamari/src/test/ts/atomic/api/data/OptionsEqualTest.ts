import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import { optionSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';

import { assert, UnitTest } from '@ephox/bedrock';
import Jsc from '@ephox/wrap-jsverify';
import * as Fun from 'ephox/katamari/api/Fun';

const boom = Fun.die('boom');

UnitTest.test('Options.equals', () => {
  assert.eq(true, Option.none().equals(Option.none()));

  Jsc.property('Option.none() !== Option.some(x)', 'json', (json: any) =>
    Jsc.eq(false, Option.none().equals(Option.some(json))));

  Jsc.property('Option.some(x) !== Option.none()', 'json', (json: any) =>
    Jsc.eq(false, (Option.some(json).equals(Option.none()))));

  Jsc.property('Option.some(x) === Option.some(x)', 'json', (json) =>
    Jsc.eq(true, Option.some(json).equals(Option.some(json))));

  Jsc.property('Option.some(x) === Option.some(x) (same ref)', 'json', (json) => {
    const ob = Option.some(json);
    return Jsc.eq(true, ob.equals(ob));
  });

  Jsc.property('Option.some(x) !== Option.some(x + y) where y is not identity', 'string', Jsc.nestring, (a, b) =>
    Jsc.eq(false, Option.some(a).equals(Option.some(a + b))));

  assert.eq(true, Option.none().equals(Option.none()));
  assert.eq(false, Option.none().equals(Option.some(3)));

  assert.eq(false, Option.some(4).equals(Option.none()));
  assert.eq(false, Option.some(2).equals(Option.some(4)));
  assert.eq(true,  Option.some(5).equals(Option.some(5)));
  assert.eq(false, Option.some(5.1).equals(Option.some(5.3)));

  const comparator = function (a, b) { return Math.round(a) === Math.round(b); };

  assert.eq(true, Option.some(5.1).equals_(Option.some(5.3), comparator));
  assert.eq(false, Option.some(5.1).equals_(Option.some(5.9), comparator));

});

UnitTest.test('Options.equals_', () => {
  assert.eq(true, Option.none().equals_(Option.none(), boom));

  Jsc.property('some !== none, for any predicate', arbOptionSome, function (opt1: Option<any>) {
    return Jsc.eq(false, opt1.equals_(Option.none(), boom));
  });

  Jsc.property('none !== some, for any predicate', arbOptionSome, function (opt1) {
    return Jsc.eq(false, Option.none().equals_(opt1, boom));
  });

  Jsc.property('Checking some(x).equals_(some(y), _, _ -> false) === false', arbOptionSome, arbOptionSome, function (opt1, opt2) {
    return Jsc.eq(false, opt1.equals_(opt2, Fun.constant(false)));
  });

  Jsc.property('Checking some(x).equals_(some(y), _, _ -> true) === true', 'json', 'json', function (json1, json2) {
    const opt1 = Option.some(json1);
    const opt2 = Option.some(json2);
    return Jsc.eq(true, opt1.equals_(opt2, Fun.constant(true)));
  });

  Jsc.property('Checking some(x).equals_(some(y), f) iff. f(x, y)', arbOptionSome, arbOptionSome, 'json, json -> bool', function (json1, json2, f) {
    const opt1 = Option.some(json1);
    const opt2 = Option.some(json2);
    return f(json1, json2) === opt1.equals_(opt2, f);
  });
});
