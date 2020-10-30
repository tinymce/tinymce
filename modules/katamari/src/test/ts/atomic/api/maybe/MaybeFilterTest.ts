import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Maybe } from 'ephox/katamari/api/Maybe';

const { just, nothing } = Maybe;

UnitTest.test('Optional.filter', () => {
  Assert.eq('filter #1', nothing, Maybe.filter(nothing, Fun.always));
  Assert.eq('filter #2', nothing, Maybe.filter(nothing, Fun.never));
  Assert.eq('filter #3', nothing, Maybe.filter(nothing, Fun.die('oof')));
  Assert.eq('filter #4', nothing, Maybe.filter(nothing, Fun.die('boom')));
  Assert.eq('filter #5', nothing, Maybe.filter(just(5), (x) => x === 8), );
  Assert.eq('filter #6', nothing, Maybe.filter(just(5), Fun.never), );
  Assert.eq('filter #7', nothing, Maybe.filter(nothing, Fun.die('boom')));
  Assert.eq('filter #8', just(6), Maybe.filter(just(6), (x) => x === 6), );
  Assert.eq('filter #9', just(6), Maybe.filter(just(6), Fun.always), );
  Assert.eq('filter', just(5), Maybe.filter(just(5), Fun.always), );
  Assert.eq('filter', nothing, Maybe.filter(just(5), Fun.never), );
});

UnitTest.test('Checking Maybe.filter(just(x), _ -> false) === none', () => {
  fc.assert(fc.property(fc.integer().map(just), (maybe) => {
    Assert.eq('eq', nothing, Maybe.filter(maybe, Fun.never));
  }));
});

UnitTest.test('Checking Maybe.filter(just(x), _ -> true) === just(x)', () => {
  fc.assert(fc.property(fc.integer(), (x) => {
    Assert.eq('eq', just(x), Maybe.filter(just(x), Fun.always));
  }));
});

UnitTest.test('Checking Maybe.filter(just(x), f) === just(x) iff. f(x)', () => {
  fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
    const opt = just(i);
    if (f(i)) {
      Assert.eq('filter true', just(i), Maybe.filter(opt, f), );
    } else {
      Assert.eq('filter false', nothing, Maybe.filter(opt, f), );
    }
  }));
});
