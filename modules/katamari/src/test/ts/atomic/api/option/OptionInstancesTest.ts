import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { Testable, Pprint } from '@ephox/dispute';

const { tNumber, tString } = Testable;

UnitTest.test('OptionInstances.testable<number>', () => {
  Assert.eq('some(3) == some(3)', Option.some(3), Option.some(3), tOption(tNumber));
  Assert.eq('some(3) == some(3) - default component eq', Option.some(3), Option.some(3), tOption());

  Assert.throws('some(3) != some(2)', () => {
    Assert.eq('some(3) == some(2)', Option.some(3), Option.some(2), tOption(tNumber));
  });

  Assert.throws('some(3) != none()', () => {
    Assert.eq('some(3) == none()', Option.some(3), Option.none(), tOption(tNumber));
  });

  Assert.throws('none() != some(3)', () => {
    Assert.eq('none() == some(3)', Option.none(), Option.some(3), tOption(tNumber));
  });

  Assert.throws('some(3) != some(2) - default component eq', () => {
    Assert.eq('some(3) == some(2)', Option.some(3), Option.some(2), tOption());
  });

  Assert.throws('some(3) != none() - default component eq', () => {
    Assert.eq('some(3) == none()', Option.some(3), Option.none(), tOption());
  });

  Assert.throws('none() != some(3) - default component eq', () => {
    Assert.eq('none() == some(3)', Option.none(), Option.some(3), tOption());
  });
});

UnitTest.test('OptionInstances.testable<string>', () => {
  Assert.eq('some("a") == some("a")', Option.some('a'), Option.some('a'), tOption(tString));
  Assert.eq('some("a") == some("a") - default component eq', Option.some('a'), Option.some('a'), tOption());

  Assert.throws('some("a") != none()', () => {
    Assert.eq('some("a") == none()', Option.some('a'), Option.none(), tOption(tString));
  });

  Assert.throws('none() != some("a")', () => {
    Assert.eq('none() == some("a")', Option.none(), Option.some('a'), tOption(tString));
  });

  Assert.throws('some("a") != some("b")', () => {
    Assert.eq('some("a") == some("b")', Option.some('a'), Option.some('b'), tOption(tString));
  });

  Assert.throws('some("a") != none() - default component eq', () => {
    Assert.eq('some("a") == none()', Option.some('a'), Option.none(), tOption());
  });

  Assert.throws('none() != some("a") - default component eq', () => {
    Assert.eq('none() == some("a")', Option.none(), Option.some('a'), tOption());
  });

  Assert.throws('some("a") != some("b") - default component eq', () => {
    Assert.eq('some("a") == some("b")', Option.some('a'), Option.some('b'), tOption());
  });
});

UnitTest.test('OptionInstances pprint', () => {
  Assert.eq('pprint none', 'Option.none()', Pprint.render(Option.none(), tOption(tString)));
  Assert.eq('pprint some string', 'Option.some(\n  "cat"\n)', Pprint.render(Option.some('cat'), tOption(tString)));

  Assert.eq('pprint none - default component pprint', 'Option.none()', Pprint.render(Option.none(), tOption()));
  Assert.eq('pprint some string - default component pprint', 'Option.some(\n  "cat"\n)', Pprint.render(Option.some('cat'), tOption()));
});
