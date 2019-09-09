import { assert, UnitTest } from '@ephox/bedrock';
import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';

const assertOption = <A> (a: Option<A>, b: Option<A>) => {
  assert.eq(true, a.equals(b));
};

const boom = function (): string {
  throw new Error('barf');
};

UnitTest.test('Options.lift2', () => {
  assertOption(Option.none<string>(), Options.lift2(Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift2(Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift2(Option.some<string>('a'), Option.none<number>(), boom));
  assertOption(Option.some<string>('a11'), Options.lift2(Option.some<string>('a'), Option.some<number>(11), (a, b) => a + b));
});

UnitTest.test('Options.lift3', () => {
  assertOption(Option.none<string>(), Options.lift3(Option.none<string>(), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift3(Option.none<string>(), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift3(Option.none<string>(), Option.some<string>('a'), Option.none<number>(), boom));

  assertOption(Option.none<string>(), Options.lift3(Option.some<string>('z'), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift3(Option.some<string>('z'), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift3(Option.some<string>('z'), Option.some<string>('a'), Option.none<number>(), boom));

  assertOption(Option.some<string>('za11'), Options.lift3(Option.some<string>('z'), Option.some<string>('a'), Option.some<number>(11), (a, b, c) => a + b + c));
});

UnitTest.test('Options.lift4', () => {
  assertOption(Option.none<string>(), Options.lift4(Option.none<number>(), Option.none<string>(), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.none<number>(), Option.none<string>(), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.none<number>(), Option.none<string>(), Option.some<string>('a'), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.none<number>(), Option.some<string>('z'), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.none<number>(), Option.some<string>('z'), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.none<number>(), Option.some<string>('z'), Option.some<string>('a'), Option.none<number>(), boom));

  assertOption(Option.none<string>(), Options.lift4(Option.some<number>(1), Option.none<string>(), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.some<number>(1), Option.none<string>(), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.some<number>(1), Option.none<string>(), Option.some<string>('a'), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.some<number>(1), Option.some<string>('z'), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.some<number>(1), Option.some<string>('z'), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift4(Option.some<number>(1), Option.some<string>('z'), Option.some<string>('a'), Option.none<number>(), boom));

  assertOption(Option.some<string>('2za11'), Options.lift4(Option.some<number>(2), Option.some<string>('z'), Option.some<string>('a'), Option.some<number>(11), (a, b, c, d) => a + b + c + d));
});

UnitTest.test('Options.lift5', () => {
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.none<number>(), Option.none<string>(), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.none<number>(), Option.none<string>(), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.none<number>(), Option.none<string>(), Option.some<string>('a'), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.none<number>(), Option.some<string>('z'), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.none<number>(), Option.some<string>('z'), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.none<number>(), Option.some<string>('z'), Option.some<string>('a'), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.some<number>(1), Option.none<string>(), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.some<number>(1), Option.none<string>(), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.some<number>(1), Option.none<string>(), Option.some<string>('a'), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.some<number>(1), Option.some<string>('z'), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.some<number>(1), Option.some<string>('z'), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.none<boolean>(), Option.some<number>(1), Option.some<string>('z'), Option.some<string>('a'), Option.none<number>(), boom));

  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.none<number>(), Option.none<string>(), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.none<number>(), Option.none<string>(), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.none<number>(), Option.none<string>(), Option.some<string>('a'), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.none<number>(), Option.some<string>('z'), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.none<number>(), Option.some<string>('z'), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.none<number>(), Option.some<string>('z'), Option.some<string>('a'), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.some<number>(1), Option.none<string>(), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.some<number>(1), Option.none<string>(), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.some<number>(1), Option.none<string>(), Option.some<string>('a'), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.some<number>(1), Option.some<string>('z'), Option.none<string>(), Option.none<number>(), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.some<number>(1), Option.some<string>('z'), Option.none<string>(), Option.some<number>(3), boom));
  assertOption(Option.none<string>(), Options.lift5(Option.some<boolean>(true), Option.some<number>(1), Option.some<string>('z'), Option.some<string>('a'), Option.none<number>(), boom));

  assertOption(Option.some<string>('false2za11'), Options.lift5(Option.some<boolean>(false), Option.some<number>(2), Option.some<string>('z'), Option.some<string>('a'), Option.some<number>(11), (a, b, c, d, e) => a + '' + b + c + d + e));
});
