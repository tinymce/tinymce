import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Fun from 'ephox/katamari/api/Fun';
import { Maybe } from 'ephox/katamari/api/Maybe';

const { just, nothing } = Maybe;

UnitTest.test('Maybe.bind: unit tests', () => {
  Assert.eq('nothing', nothing, Maybe.bind(nothing, Fun.die('Do not call')));
  Assert.eq('just -> nothing', nothing, Maybe.bind(just(3), () => nothing));
  Assert.eq('just -> just', just(3), Maybe.bind(just(3), just));
});

UnitTest.test('Maybe.bind2: unit tests', () => {
  Assert.eq('nothing', nothing, Maybe.bind2(nothing, Fun.die('Do not call')));
  Assert.eq('just -> null', nothing, Maybe.bind2(just(3), Fun.constant(null)));
  Assert.eq('just -> undefined', nothing, Maybe.bind2(just(3), Fun.constant(undefined)));
  Assert.eq('just -> just', just(3), Maybe.bind2(just(3), Fun.identity));
});