import fc from 'fast-check';
import { Future } from 'ephox/katamari/api/Future';
import { Optional } from 'ephox/katamari/api/Optional';
import { Result } from 'ephox/katamari/api/Result';

type Arbitrary<A> = fc.Arbitrary<A>;

export const arbResultError = <A, E> (arbE: Arbitrary<E>): Arbitrary<Result<A, E>> =>
  arbE.map(Result.error);

export const arbResultValue = <A, E> (arbA: Arbitrary<A>): Arbitrary<Result<A, E>> =>
  arbA.map(Result.value);

export const arbResult = <A, E> (arbA: Arbitrary<A>, arbE: Arbitrary<E>): Arbitrary<Result<A, E>> =>
  fc.oneof(arbResultError<A, E>(arbE), arbResultValue<A, E>(arbA));

export const arbOptionalNone = <T> () => fc.constant(Optional.none());
export const arbOptionalSome = <T> (at: Arbitrary<T>) => at.map(Optional.some);

export const arbOptional = <T> (at: Arbitrary<T>) => fc.oneof(arbOptionalNone(), arbOptionalSome(at));

export const arbNegativeInteger = () => fc.integer(Number.MIN_SAFE_INTEGER, -1);

export const arbFutureNow = <A> (arbA: Arbitrary<A>): Arbitrary<Future<A>> =>
  arbA.map(Future.pure);

export const arbFutureSoon = <A> (arbA: Arbitrary<A>): Arbitrary<Future<A>> =>
  arbA.map((a) => Future.nu((cb) => {
    setTimeout(() => {
      cb(a);
    }, 5);
  }));

export const arbFutureNever = <A> (): Arbitrary<Future<A>> =>
  fc.constant(Future.nu(() => {}));

export const arbFutureNowOrSoon = <A> (arbA: Arbitrary<A>): Arbitrary<Future<A>> =>
  fc.oneof(arbFutureNow(arbA), arbFutureSoon(arbA));
