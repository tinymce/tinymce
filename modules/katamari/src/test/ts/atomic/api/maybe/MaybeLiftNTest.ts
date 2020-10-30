import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Maybes from 'ephox/katamari/api/Maybes';

const { nothing, just } = Maybes;

const boom = function (): string {
  throw new Error('barf');
};

UnitTest.test('Maybes.lift2', () => {
  Assert.eq('maybe eq', nothing, Maybes.lift2(nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift2(nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift2(just('a'), nothing, boom));
  Assert.eq('maybe eq', just('a11'), Maybes.lift2(just('a'), just(11), (a, b) => a + b));
});

UnitTest.test('Maybes.lift3', () => {
  Assert.eq('maybe eq', nothing, Maybes.lift3(nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift3(nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift3(nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift3(nothing, just('a'), just(3), boom));

  Assert.eq('maybe eq', nothing, Maybes.lift3(just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift3(just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift3(just('z'), just('a'), nothing, boom));

  Assert.eq('maybe eq', just('za11'), Maybes.lift3(just('z'), just('a'), just(11), (a, b, c) => a + b + c));
});

UnitTest.test('Maybes.lift4', () => {
  Assert.eq('maybe eq', nothing, Maybes.lift4(nothing, nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(nothing, nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(nothing, nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(nothing, nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(nothing, just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(nothing, just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(nothing, just('z'), just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(nothing, just('z'), just('a'), just(3), boom));

  Assert.eq('maybe eq', nothing, Maybes.lift4(just(1), nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(just(1), nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(just(1), nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(just(1), nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(just(1), just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(just(1), just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift4(just(1), just('z'), just('a'), nothing, boom));

  Assert.eq('maybe eq', just('2za11'), Maybes.lift4(just(2), just('z'), just('a'), just(11), (a, b, c, d) => a + b + c + d));
});

UnitTest.test('Maybes.lift5', () => {
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, nothing, nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, nothing, nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, nothing, nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, nothing, nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, nothing, just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, nothing, just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, nothing, just('z'), just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, nothing, just('z'), just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, just(1), nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, just(1), nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, just(1), nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, just(1), nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, just(1), just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, just(1), just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, just(1), just('z'), just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(nothing, just(1), just('z'), just('a'), just(3), boom));

  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), nothing, nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), nothing, nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), nothing, nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), nothing, nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), nothing, just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), nothing, just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), nothing, just('z'), just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), nothing, just('z'), just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), just(1), nothing, nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), just(1), nothing, nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), just(1), nothing, just('a'), nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), just(1), nothing, just('a'), just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), just(1), just('z'), nothing, nothing, boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), just(1), just('z'), nothing, just(3), boom));
  Assert.eq('maybe eq', nothing, Maybes.lift5(just(true), just(1), just('z'), just('a'), nothing, boom));

  Assert.eq('maybe eq', just('false2za11'), Maybes.lift5(just(false), just(2), just('z'), just('a'), just(11), (a, b, c, d, e) => a + '' + b + c + d + e));
});
