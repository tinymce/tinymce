import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import * as Optionals from 'ephox/katamari/api/Optionals';

const assertOption = <A> (a: Optional<A>, b: Optional<A>) => {
  Assert.eq('option eq', a, b, tOptional());
};

const boom = function (): string {
  throw new Error('barf');
};

UnitTest.test('Optionals.lift2', () => {
  assertOption(Optional.none<string>(), Optionals.lift2(Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift2(Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift2(Optional.some<string>('a'), Optional.none<number>(), boom));
  assertOption(Optional.some<string>('a11'), Optionals.lift2(Optional.some<string>('a'), Optional.some<number>(11), (a, b) => a + b));
});

UnitTest.test('Optionals.lift3', () => {
  assertOption(Optional.none<string>(), Optionals.lift3(Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift3(Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift3(Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));

  assertOption(Optional.none<string>(), Optionals.lift3(Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift3(Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift3(Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

  assertOption(Optional.some<string>('za11'), Optionals.lift3(Optional.some<string>('z'), Optional.some<string>('a'), Optional.some<number>(11), (a, b, c) => a + b + c));
});

UnitTest.test('Optionals.lift4', () => {
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.none<number>(), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.none<number>(), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

  assertOption(Optional.none<string>(), Optionals.lift4(Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.some<number>(1), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift4(Optional.some<number>(1), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

  assertOption(Optional.some<string>('2za11'), Optionals.lift4(Optional.some<number>(2), Optional.some<string>('z'), Optional.some<string>('a'), Optional.some<number>(11), (a, b, c, d) => a + b + c + d));
});

UnitTest.test('Optionals.lift5', () => {
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
  assertOption(Optional.none<string>(), Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

  assertOption(Optional.some<string>('false2za11'), Optionals.lift5(Optional.some<boolean>(false), Optional.some<number>(2), Optional.some<string>('z'), Optional.some<string>('a'), Optional.some<number>(11), (a, b, c, d, e) => a + '' + b + c + d + e));
});
