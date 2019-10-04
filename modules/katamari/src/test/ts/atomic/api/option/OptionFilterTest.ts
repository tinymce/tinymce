import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { Assert, UnitTest } from '@ephox/bedrock';
import { Testable } from '@ephox/dispute';
import Jsc from '@ephox/wrap-jsverify';
import { optionSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';

const { die, constant } = Fun;
const { some, none } = Option;
const { tNumber } = Testable;

UnitTest.test('Option.filter', () => {
  Assert.eq('filtes #1', none(), none<number>().filter(constant(true)), tOption());
  Assert.eq('filter #2', none(), none<number>().filter(constant(false)), tOption());
  Assert.eq('filter #3', none(), none<number>().filter(die('oof')), tOption());
  Assert.eq('filter #4', none(), none().filter(die('boom')), tOption());
  Assert.eq('filter #5', none(), some(5).filter((x) => x === 8), tOption(tNumber));
  Assert.eq('filter #6', none(), some(5).filter(constant(false)), tOption(tNumber));
  Assert.eq('filter #7', none(), none().filter(die('boom')), tOption());

  Jsc.property('Checking some(x).filter(_ -> false) === none', arbOptionSome, function (opt) {
    return Jsc.eq(true, tOption().eq(
      none(),
      opt.filter(Fun.constant(false))));
  });

  Jsc.property('Checking some(x).filter(_ -> true) === some(x)', 'json', function (x) {
    return Jsc.eq(true, tOption().eq(
      some(x),
      some(x).filter(Fun.constant(true))
    ));
  });

  Jsc.property('Checking some(x).filter(f) === some(x) iff. f(x)', 'json', Jsc.fun(Jsc.bool), function (json, f) {
    const opt = Option.some(json);
    return f(json) === true ? Jsc.eq(json, opt.filter(f).getOrDie()) : Jsc.eq(true, opt.filter(f).isNone());
  });
});
