import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Maybes } from '@ephox/katamari';
import * as Fun from 'ephox/katamari/api/Fun';

const { just, nothing } = Maybes;

UnitTest.test('Maybes.bind: unit tests', () => {
  Assert.eq('nothing', nothing, Maybes.bind(nothing, Fun.die('Do not call')));
  Assert.eq('just -> nothing', nothing, Maybes.bind(just(3), () => nothing));
  Assert.eq('just -> just', just(3), Maybes.bind(just(3), just));
});

UnitTest.test('Maybes.bind2: unit tests', () => {
  Assert.eq('nothing', nothing, Maybes.bind2(nothing, Fun.die('Do not call')));
  Assert.eq('just -> null', nothing, Maybes.bind2(just(3), Fun.constant(null)));
  Assert.eq('just -> undefined', nothing, Maybes.bind2(just(3), Fun.constant(undefined)));
  Assert.eq('just -> just', just(3), Maybes.bind2(just(3), Fun.identity));
});