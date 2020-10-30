import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Maybes from 'ephox/katamari/api/Maybes';

const { just, nothing } = Maybes;

UnitTest.test('Optional.filter', () => {
  Assert.eq('filter #1', nothing, Maybes.filter(nothing, Fun.always));
  Assert.eq('filter #2', nothing, Maybes.filter(nothing, Fun.never));
  Assert.eq('filter #3', nothing, Maybes.filter(nothing, Fun.die('oof')));
  Assert.eq('filter #4', nothing, Maybes.filter(nothing, Fun.die('boom')));
  Assert.eq('filter #5', nothing, Maybes.filter(just(5), (x) => x === 8), );
  Assert.eq('filter #6', nothing, Maybes.filter(just(5), Fun.never), );
  Assert.eq('filter #7', nothing, Maybes.filter(nothing, Fun.die('boom')));
  Assert.eq('filter #8', just(6), Maybes.filter(just(6), (x) => x === 6), );
  Assert.eq('filter #9', just(6), Maybes.filter(just(6), Fun.always), );
  Assert.eq('filter', just(5), Maybes.filter(just(5), Fun.always), );
  Assert.eq('filter', nothing, Maybes.filter(just(5), Fun.never), );
});

UnitTest.test('Checking Maybes.filter(just(x), _ -> false) === none', () => {
  fc.assert(fc.property(fc.integer().map(just), (maybe) => {
    Assert.eq('eq', nothing, Maybes.filter(maybe, Fun.never));
  }));
});

UnitTest.test('Checking Maybes.filter(just(x), _ -> true) === just(x)', () => {
  fc.assert(fc.property(fc.integer(), (x) => {
    Assert.eq('eq', just(x), Maybes.filter(just(x), Fun.always));
  }));
});

UnitTest.test('Checking Maybes.filter(just(x), f) === just(x) iff. f(x)', () => {
  fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
    const opt = just(i);
    if (f(i)) {
      Assert.eq('filter true', just(i), Maybes.filter(opt, f), );
    } else {
      Assert.eq('filter false', nothing, Maybes.filter(opt, f), );
    }
  }));
});
