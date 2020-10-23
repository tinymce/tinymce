import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import { arbOptionalSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';

const { some, none } = Optional;
const { tNumber } = Testable;

UnitTest.test('Optional.filter', () => {
  Assert.eq('filter #1', none(), none<number>().filter(Fun.always), tOptional());
  Assert.eq('filter #2', none(), none<number>().filter(Fun.never), tOptional());
  Assert.eq('filter #3', none(), none<number>().filter(Fun.die('oof')), tOptional());
  Assert.eq('filter #4', none(), none().filter(Fun.die('boom')), tOptional());
  Assert.eq('filter #5', none(), some(5).filter((x) => x === 8), tOptional(tNumber));
  Assert.eq('filter #6', none(), some(5).filter(Fun.never), tOptional(tNumber));
  Assert.eq('filter #7', none(), none().filter(Fun.die('boom')), tOptional());
  Assert.eq('filter #8', some(6), some(6).filter((x) => x === 6), tOptional(tNumber));
  Assert.eq('filter #9', some(6), some(6).filter(Fun.always), tOptional(tNumber));
  Assert.eq('filter', some(5), some(5).filter(Fun.always), tOptional(tNumber));
  Assert.eq('filter', none(), some(5).filter(Fun.never), tOptional(tNumber));
});

UnitTest.test('Checking some(x).filter(_ -> false) === none', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => {
    Assert.eq('eq', true, tOptional().eq(
      none(),
      opt.filter(Fun.never)));
  }));
});

UnitTest.test('Checking some(x).filter(_ -> true) === some(x)', () => {
  fc.assert(fc.property(fc.integer(), (x) => {
    Assert.eq('eq', true, tOptional().eq(
      some(x),
      some(x).filter(Fun.always)
    ));
  }));
});

UnitTest.test('Checking some(x).filter(f) === some(x) iff. f(x)', () => {
  fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
    const opt = some(i);
    if (f(i)) {
      Assert.eq('filter true', Optional.some(i), opt.filter(f), tOptional(tNumber));
    } else {
      Assert.eq('filter false', Optional.none(), opt.filter(f), tOptional(tNumber));
    }
  }));
});
