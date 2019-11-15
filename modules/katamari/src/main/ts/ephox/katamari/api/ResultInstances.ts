import * as Fun from './Fun';
import { Result } from './Result';
import { Pprint, Eq, Testable, Pnode } from '@ephox/dispute';

type Pprint<A> = Pprint.Pprint<A>;
type Eq<A> = Eq.Eq<A>;
type Testable<A> = Testable.Testable<A>;

const ppHelper = <A> (s: string, pp: Pprint<A>) => (a: A) => Pnode.pnode('Result.' + s + '(', [ pp.pprint(a) ], ')');

export const pprintResult = <A, E> (pprintA: Pprint<A> = Pprint.pprintAny, pprintE: Pprint<E> = Pprint.pprintAny): Pprint<Result<A, E>> =>
  Pprint.pprint((r) => r.fold(ppHelper('error', pprintE), ppHelper('value', pprintA)));

export const eqResult = <A, E> (eqA: Eq<A> = Eq.eqAny, eqE: Eq<E> = Eq.eqAny): Eq<Result<A, E>> =>
  Eq.eq((oa, ob) => oa.fold(
    (e1) => ob.fold((e2) => eqE.eq(e1, e2), Fun.never),
    (a1) => ob.fold(Fun.never, (a2) => eqA.eq(a1, a2))
  ));

export const tResult = <A, E> (testableA: Testable<A> = Testable.tAny, testableE: Testable<E> = Testable.tAny): Testable<Result<A, E>> =>
  Testable.testable(eqResult(testableA, testableE), pprintResult(testableA, testableE));
