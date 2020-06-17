import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { arbOptionSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';
import fc from 'fast-check';

const { die, constant } = Fun;
const { some, none } = Option;
const { tNumber } = Testable;

UnitTest.test('Option.filter', () => {
  Assert.eq('filter #1', none(), none<number>().filter(constant(true)), tOption());
  Assert.eq('filter #2', none(), none<number>().filter(constant(false)), tOption());
  Assert.eq('filter #3', none(), none<number>().filter(die('oof')), tOption());
  Assert.eq('filter #4', none(), none().filter(die('boom')), tOption());
  Assert.eq('filter #5', none(), some(5).filter((x) => x === 8), tOption(tNumber));
  Assert.eq('filter #6', none(), some(5).filter(constant(false)), tOption(tNumber));
  Assert.eq('filter #7', none(), none().filter(die('boom')), tOption());
  Assert.eq('filter #8', some(6), some(6).filter((x) => x === 6), tOption(tNumber));
  Assert.eq('filter #9', some(6), some(6).filter(Fun.constant(true)), tOption(tNumber));
  Assert.eq('filter', some(5), some(5).filter(Fun.constant(true)), tOption(tNumber));
  Assert.eq('filter', none(), some(5).filter(Fun.constant(false)), tOption(tNumber));
});

UnitTest.test('Checking some(x).filter(_ -> false) === none', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => {
    Assert.eq('eq', true, tOption().eq(
      none(),
      opt.filter(Fun.constant(false))));
  }));
});

UnitTest.test('Checking some(x).filter(_ -> true) === some(x)', () => {
  fc.assert(fc.property(fc.integer(), (x) => {
    Assert.eq('eq', true, tOption().eq(
      some(x),
      some(x).filter(Fun.constant(true))
    ));
  }));
});

UnitTest.test('Checking some(x).filter(f) === some(x) iff. f(x)', () => {
  fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
    const opt = some(i);
    if (f(i)) {
      Assert.eq('filter true', Option.some(i), opt.filter(f), tOption(tNumber));
    } else {
      Assert.eq('filter false', Option.none(), opt.filter(f), tOption(tNumber));
    }
  }));
});
