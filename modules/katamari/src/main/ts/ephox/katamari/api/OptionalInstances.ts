import { Eq, Pnode, Pprint, Testable } from '@ephox/dispute';

import { Optional } from './Optional';
import * as Optionals from './Optionals';

type PprintType<A> = Pprint.Pprint<A>;
type EqType<A> = Eq.Eq<A>;
type TestableType<A> = Testable.Testable<A>;

export const pprintOptional = <A> (pprintA: PprintType<A> = Pprint.pprintAny): PprintType<Optional<A>> => Pprint.pprint((oa: Optional<A>) =>
  oa.fold(
    () => Pnode.single('Optional.none()'),
    (a) => Pnode.pnode('Optional.some(', [ pprintA.pprint(a) ], ')')
  )
);

export const eqOptional = <A> (eqA: EqType<A> = Eq.eqAny): EqType<Optional<A>> =>
  Eq.eq((oa, ob) => Optionals.equals(oa, ob, eqA.eq));

export const tOptional = <A> (testableA: TestableType<A> = Testable.tAny): TestableType<Optional<A>> =>
  Testable.testable(eqOptional(testableA), pprintOptional(testableA));
