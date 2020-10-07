import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Maybe from 'ephox/katamari/api/Maybe';
import { tMaybe } from 'ephox/katamari/api/MaybeInstances';

const { just, nothing } = Maybe;

UnitTest.test('Maybe.bind: unit tests', () => {
  Assert.eq('nothing', nothing, Maybe.bind(nothing, Fun.die('Do not call')), tMaybe());
  Assert.eq('just -> nothing', nothing, Maybe.bind(just(3), () => nothing), tMaybe());
  Assert.eq('just -> just', just(3), Maybe.bind(just(3), just), tMaybe());
});

UnitTest.test('Maybe.bind2: unit tests', () => {
  Assert.eq('nothing', nothing, Maybe.bind2(nothing, Fun.die('Do not call')), tMaybe());
  Assert.eq('just -> null', nothing, Maybe.bind2(just(3), Fun.constant(null)), tMaybe());
  Assert.eq('just -> undefined', nothing, Maybe.bind2(just(3), Fun.constant(undefined)), tMaybe());
  Assert.eq('just -> just', just(3), Maybe.bind2(just(3), Fun.identity), tMaybe());
});