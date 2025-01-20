import { Eq, Pnode, Pprint, Testable } from '@ephox/dispute';

import * as Fun from './Fun';
import { Result } from './Result';

type PprintType<A> = Pprint.Pprint<A>;
type EqType<A> = Eq.Eq<A>;
type TestableType<A> = Testable.Testable<A>;

const ppHelper = <A> (s: string, pp: PprintType<A>) => (a: A) => Pnode.pnode('Result.' + s + '(', [ pp.pprint(a) ], ')');

export const pprintResult = <A, E> (pprintA: PprintType<A> = Pprint.pprintAny, pprintE: PprintType<E> = Pprint.pprintAny): PprintType<Result<A, E>> =>
  Pprint.pprint((r) => r.fold(ppHelper('error', pprintE), ppHelper('value', pprintA)));

export const eqResult = <A, E> (eqA: EqType<A> = Eq.eqAny, eqE: EqType<E> = Eq.eqAny): EqType<Result<A, E>> =>
  Eq.eq((oa, ob) => oa.fold(
    (e1) => ob.fold((e2) => eqE.eq(e1, e2), Fun.never),
    (a1) => ob.fold(Fun.never, (a2) => eqA.eq(a1, a2))
  ));

export const tResult = <A, E> (testableA: TestableType<A> = Testable.tAny, testableE: TestableType<E> = Testable.tAny): TestableType<Result<A, E>> =>
  Testable.testable(eqResult(testableA, testableE), pprintResult(testableA, testableE));
