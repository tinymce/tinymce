import { Eq, Pnode, Pprint, Testable } from '@ephox/dispute';

import { Optional } from './Optional';
import * as Optionals from './Optionals';

type Pprint<A> = Pprint.Pprint<A>;
type Eq<A> = Eq.Eq<A>;
type Testable<A> = Testable.Testable<A>;

export const pprintOptional = <A> (pprintA: Pprint<A> = Pprint.pprintAny): Pprint<Optional<A>> => Pprint.pprint((oa: Optional<A>) =>
  oa.fold(
    () => Pnode.single('Optional.none()'),
    (a) => Pnode.pnode('Optional.some(', [ pprintA.pprint(a) ], ')')
  )
);

export const eqOptional = <A> (eqA: Eq<A> = Eq.eqAny): Eq<Optional<A>> =>
  Eq.eq((oa, ob) => Optionals.equals(oa, ob, eqA.eq));

export const tOptional = <A> (testableA: Testable<A> = Testable.tAny): Testable<Optional<A>> =>
  Testable.testable(eqOptional(testableA), pprintOptional(testableA));
