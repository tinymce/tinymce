import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Pprint, Testable } from '@ephox/dispute';
import { Maybe } from 'ephox/katamari/api/Maybe';
import { tMaybe } from 'ephox/katamari/api/MaybeInstances';

const { tNumber, tString } = Testable;

UnitTest.test('MaybeInstances.testable<number>', () => {
  Assert.eq('just(3) == just(3)', Maybe.just(3), Maybe.just(3), tMaybe(tNumber));
  Assert.eq('just(3) == just(3) - default component eq', Maybe.just(3), Maybe.just(3), tMaybe());

  Assert.throws('just(3) != just(2)', () => {
    Assert.eq('just(3) == just(2)', Maybe.just(3), Maybe.just(2), tMaybe(tNumber));
  });

  Assert.throws('just(3) != nothing', () => {
    Assert.eq('just(3) == nothing', Maybe.just(3), Maybe.nothing, tMaybe(tNumber));
  });

  Assert.throws('nothing != just(3)', () => {
    Assert.eq('nothing == just(3)', Maybe.nothing, Maybe.just(3), tMaybe(tNumber));
  });

  Assert.throws('just(3) != just(2) - default component eq', () => {
    Assert.eq('just(3) == just(2)', Maybe.just(3), Maybe.just(2), tMaybe());
  });

  Assert.throws('just(3) != nothing - default component eq', () => {
    Assert.eq('just(3) == nothing', Maybe.just(3), Maybe.nothing, tMaybe());
  });

  Assert.throws('nothing != just(3) - default component eq', () => {
    Assert.eq('nothing == just(3)', Maybe.nothing, Maybe.just(3), tMaybe());
  });
});

UnitTest.test('MaybeInstances.testable<string>', () => {
  Assert.eq('just("a") == just("a")', Maybe.just('a'), Maybe.just('a'), tMaybe(tString));
  Assert.eq('just("a") == just("a") - default component eq', Maybe.just('a'), Maybe.just('a'), tMaybe());

  Assert.throws('just("a") != nothing', () => {
    Assert.eq('just("a") == nothing', Maybe.just('a'), Maybe.nothing, tMaybe(tString));
  });

  Assert.throws('nothing != just("a")', () => {
    Assert.eq('nothing == just("a")', Maybe.nothing, Maybe.just('a'), tMaybe(tString));
  });

  Assert.throws('just("a") != just("b")', () => {
    Assert.eq('just("a") == just("b")', Maybe.just('a'), Maybe.just('b'), tMaybe(tString));
  });

  Assert.throws('just("a") != nothing - default component eq', () => {
    Assert.eq('just("a") == nothing', Maybe.just('a'), Maybe.nothing, tMaybe());
  });

  Assert.throws('nothing != just("a") - default component eq', () => {
    Assert.eq('nothing == just("a")', Maybe.nothing, Maybe.just('a'), tMaybe());
  });

  Assert.throws('just("a") != just("b") - default component eq', () => {
    Assert.eq('just("a") == just("b")', Maybe.just('a'), Maybe.just('b'), tMaybe());
  });
});

UnitTest.test('MaybeInstances pprint', () => {
  Assert.eq('pprint none', 'Maybe.nothing', Pprint.render(Maybe.nothing, tMaybe(tString)));
  Assert.eq('pprint just string', 'Maybe.just(\n  "cat"\n)', Pprint.render(Maybe.just('cat'), tMaybe(tString)));

  Assert.eq('pprint none - default component pprint', 'Maybe.nothing', Pprint.render(Maybe.nothing, tMaybe()));
  Assert.eq('pprint just string - default component pprint', 'Maybe.just(\n  "cat"\n)', Pprint.render(Maybe.just('cat'), tMaybe()));
});
