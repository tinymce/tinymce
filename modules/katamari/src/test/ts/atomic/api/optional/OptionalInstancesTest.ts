import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Pprint, Testable } from '@ephox/dispute';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';

const { tNumber, tString } = Testable;

UnitTest.test('OptionalInstances.testable<number>', () => {
  Assert.eq('some(3) == some(3)', Optional.some(3), Optional.some(3), tOptional(tNumber));
  Assert.eq('some(3) == some(3) - default component eq', Optional.some(3), Optional.some(3), tOptional());

  Assert.throws('some(3) != some(2)', () => {
    Assert.eq('some(3) == some(2)', Optional.some(3), Optional.some(2), tOptional(tNumber));
  });

  Assert.throws('some(3) != none()', () => {
    Assert.eq('some(3) == none()', Optional.some(3), Optional.none(), tOptional(tNumber));
  });

  Assert.throws('none() != some(3)', () => {
    Assert.eq('none() == some(3)', Optional.none(), Optional.some(3), tOptional(tNumber));
  });

  Assert.throws('some(3) != some(2) - default component eq', () => {
    Assert.eq('some(3) == some(2)', Optional.some(3), Optional.some(2), tOptional());
  });

  Assert.throws('some(3) != none() - default component eq', () => {
    Assert.eq('some(3) == none()', Optional.some(3), Optional.none(), tOptional());
  });

  Assert.throws('none() != some(3) - default component eq', () => {
    Assert.eq('none() == some(3)', Optional.none(), Optional.some(3), tOptional());
  });
});

UnitTest.test('OptionalInstances.testable<string>', () => {
  Assert.eq('some("a") == some("a")', Optional.some('a'), Optional.some('a'), tOptional(tString));
  Assert.eq('some("a") == some("a") - default component eq', Optional.some('a'), Optional.some('a'), tOptional());

  Assert.throws('some("a") != none()', () => {
    Assert.eq('some("a") == none()', Optional.some('a'), Optional.none(), tOptional(tString));
  });

  Assert.throws('none() != some("a")', () => {
    Assert.eq('none() == some("a")', Optional.none(), Optional.some('a'), tOptional(tString));
  });

  Assert.throws('some("a") != some("b")', () => {
    Assert.eq('some("a") == some("b")', Optional.some('a'), Optional.some('b'), tOptional(tString));
  });

  Assert.throws('some("a") != none() - default component eq', () => {
    Assert.eq('some("a") == none()', Optional.some('a'), Optional.none(), tOptional());
  });

  Assert.throws('none() != some("a") - default component eq', () => {
    Assert.eq('none() == some("a")', Optional.none(), Optional.some('a'), tOptional());
  });

  Assert.throws('some("a") != some("b") - default component eq', () => {
    Assert.eq('some("a") == some("b")', Optional.some('a'), Optional.some('b'), tOptional());
  });
});

UnitTest.test('OptionalInstances pprint', () => {
  Assert.eq('pprint none', 'Optional.none()', Pprint.render(Optional.none(), tOptional(tString)));
  Assert.eq('pprint some string', 'Optional.some(\n  "cat"\n)', Pprint.render(Optional.some('cat'), tOptional(tString)));

  Assert.eq('pprint none - default component pprint', 'Optional.none()', Pprint.render(Optional.none(), tOptional()));
  Assert.eq('pprint some string - default component pprint', 'Optional.some(\n  "cat"\n)', Pprint.render(Optional.some('cat'), tOptional()));
});
