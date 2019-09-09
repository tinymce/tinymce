import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import { optionSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';

import { assert, UnitTest } from '@ephox/bedrock';
import Jsc from '@ephox/wrap-jsverify';
import * as Fun from 'ephox/katamari/api/Fun';

UnitTest.test('Options.equals', () => {
  assert.eq(true, Options.equals(Option.none(), Option.none()));

  Jsc.property('Option.none() !== Option.some(x)', 'json', (json: any) =>
    Jsc.eq(false, Options.equals(Option.none(), Option.some(json))));

  Jsc.property('Option.some(x) !== Option.none()', 'json', (json: any) =>
    Jsc.eq(false, Options.equals(Option.some(json), Option.none())));

  Jsc.property('Option.some(x) === Option.some(x)', 'json', (json) =>
    Jsc.eq(true, Options.equals(Option.some(json), Option.some(json))));

  Jsc.property('Option.some(x) === Option.some(x) (same ref)', 'json', (json) => {
    const ob = Option.some(json);
    return Jsc.eq(true, Options.equals(ob, ob));
  });

  Jsc.property('Option.some(x) !== Option.some(x + y) where y is not identity', 'string', Jsc.nestring, (a, b) =>
    Jsc.eq(false, Options.equals(Option.some(a), Option.some(a + b))));
});

UnitTest.test('Options.equals_', () => {
  assert.eq(true, Options.equals_(Fun.die('boom'))(Option.none(), Option.none()));

  Jsc.property('some !== none, for any predicate', arbOptionSome, function (opt1: Option<any>) {
    return Jsc.eq(false, Options.equals_(Fun.die('boom'))(opt1, Option.none()));
  });

  Jsc.property('none !== some, for any predicate', arbOptionSome, function (opt1) {
    return Jsc.eq(false, Options.equals_(Fun.die('boom'))(Option.none(), opt1));
  });

  Jsc.property('Checking some(x).equals_(some(y), _, _ -> false) === false', arbOptionSome, arbOptionSome, function (opt1, opt2) {
    return Jsc.eq(false, Options.equals_(Fun.constant(false))(opt1, opt2));
  });

  Jsc.property('Checking some(x).equals_(some(y), _, _ -> true) === true', 'json', 'json', function (json1, json2) {
    const opt1 = Option.some(json1);
    const opt2 = Option.some(json2);
    return Jsc.eq(true, Options.equals_(Fun.constant(true))(opt1, opt2));
  });

  Jsc.property('Checking some(x).equals_(some(y), f) iff. f(x, y)', arbOptionSome, arbOptionSome, 'json, json -> bool', function (json1, json2, f) {
    const opt1 = Option.some(json1);
    const opt2 = Option.some(json2);
    return f(json1, json2) === Options.equals_(f)(opt1, opt2);
  });
});
