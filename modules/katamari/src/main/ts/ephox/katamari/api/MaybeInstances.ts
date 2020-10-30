import { Eq, Pnode, Pprint, Testable } from '@ephox/dispute';
import { Maybe } from './Maybe';

type Pprint<A> = Pprint.Pprint<A>;
type Eq<A> = Eq.Eq<A>;
type Testable<A> = Testable.Testable<A>;

export const pprintMaybe = <A> (pprintA: Pprint<A> = Pprint.pprintAny): Pprint<Maybe<A>> => Pprint.pprint((ma: Maybe<A>) => {
  switch (ma.tag) {
    case 'NOTHING':
      return Pnode.single('Maybe.nothing');
    case 'JUST':
      return Pnode.pnode('Maybe.just(', [ pprintA.pprint(ma.value) ], ')');
  }
});

export const eqMaybe = <A> (eqA: Eq<A> = Eq.eqAny): Eq<Maybe<A>> =>
  Eq.eq((oa, ob) => Maybe.equals_(oa, ob, eqA.eq));

export const tMaybe = <A> (testableA: Testable<A> = Testable.tAny): Testable<Maybe<A>> =>
  Testable.testable(eqMaybe(testableA), pprintMaybe(testableA));
