import { Assert, TestLabel } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import { Option, OptionInstances, Result, ResultInstances } from '@ephox/katamari';

const { tOption } = OptionInstances;
const { tResult } = ResultInstances;
const { tAny } = Testable;
type Testable<A> = Testable.Testable<A>;

// NOTE: Don't use this within Agar - use tOption directly

export const eqOption = <A> (message: TestLabel, expected: Option<A>, actual: Option<A>, testableA: Testable<A> = tAny): void =>
  Assert.eq(message, expected, actual, tOption(testableA));

export const eqNone = <A> (message: TestLabel, actual: Option<A>): void =>
  eqOption(message, Option.none<A>(), actual, tAny);

export const eqSome = <A> (message: TestLabel, expected: A, actual: Option<A>, testableA: Testable<A> = tAny): void =>
  eqOption(message, Option.some<A>(expected), actual, testableA);

export const eqResult = <A, E> (message: TestLabel, expected: Result<A, E>, actual: Result<A, E>, testableA: Testable<A> = tAny, testableE: Testable<E> = tAny) =>
  Assert.eq(message, expected, actual, tResult(testableA, testableE));

export const eqValue = <A, E> (message: TestLabel, expected: A, actual: Result<A, E>, testableA: Testable<A> = tAny, testableE: Testable<E> = tAny) =>
  eqResult(message, Result.value(expected), actual, testableA, testableE);

export const eqError = <A, E> (message: TestLabel, expected: E, actual: Result<A, E>, testableA: Testable<A> = tAny, testableE: Testable<E> = tAny) =>
  eqResult(message, Result.error(expected), actual, testableA, testableE);
