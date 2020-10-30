import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Maybe } from 'ephox/katamari/api/Maybe';

const { nothing, just } = Maybe;

const boom = function (): string {
  throw new Error('barf');
};

UnitTest.test('Maybe.lift2', () => {
  Assert.eq('maybe eq', nothing, Maybe.lift2(nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift2(nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift2(just('a'), nothing, boom));
  Assert.eq('maybe eq', just('a11'), Maybe.lift2(just('a'), just(11), (a, b) => a + b));
});

UnitTest.test('Maybe.lift3', () => {
  Assert.eq('maybe eq', nothing, Maybe.lift3(nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift3(nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift3(nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift3(nothing, just('a'), just(3), boom));

  Assert.eq('maybe eq', nothing, Maybe.lift3(just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift3(just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift3(just('z'), just('a'), nothing, boom));

  Assert.eq('maybe eq', just('za11'), Maybe.lift3(just('z'), just('a'), just(11), (a, b, c) => a + b + c));
});

UnitTest.test('Maybe.lift4', () => {
  Assert.eq('maybe eq', nothing, Maybe.lift4(nothing, nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(nothing, nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(nothing, nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(nothing, nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(nothing, just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(nothing, just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(nothing, just('z'), just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(nothing, just('z'), just('a'), just(3), boom));

  Assert.eq('maybe eq', nothing, Maybe.lift4(just(1), nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(just(1), nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(just(1), nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(just(1), nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(just(1), just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(just(1), just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift4(just(1), just('z'), just('a'), nothing, boom));

  Assert.eq('maybe eq', just('2za11'), Maybe.lift4(just(2), just('z'), just('a'), just(11), (a, b, c, d) => a + b + c + d));
});

UnitTest.test('Maybe.lift5', () => {
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, nothing, nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, nothing, nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, nothing, nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, nothing, nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, nothing, just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, nothing, just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, nothing, just('z'), just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, nothing, just('z'), just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, just(1), nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, just(1), nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, just(1), nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, just(1), nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, just(1), just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, just(1), just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, just(1), just('z'), just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(nothing, just(1), just('z'), just('a'), just(3), boom));

  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), nothing, nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), nothing, nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), nothing, nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), nothing, nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), nothing, just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), nothing, just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), nothing, just('z'), just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), nothing, just('z'), just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), just(1), nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), just(1), nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), just(1), nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), just(1), nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), just(1), just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), just(1), just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybe.lift5(just(true), just(1), just('z'), just('a'), nothing, boom));

  Assert.eq('maybe eq', just('false2za11'), Maybe.lift5(just(false), just(2), just('z'), just('a'), just(11), (a, b, c, d, e) => a + '' + b + c + d + e));
});
