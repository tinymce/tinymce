import { Option } from './Option';
import { Pprint, Eq, Testable, Pnode } from '@ephox/dispute';

type Pprint<A> = Pprint.Pprint<A>;
type Eq<A> = Eq.Eq<A>;
type Testable<A> = Testable.Testable<A>;

export const pprintOption = <A> (pprintA: Pprint<A> = Pprint.pprintAny): Pprint<Option<A>> => Pprint.pprint((oa: Option<A>) =>
  oa.fold(
    () => Pnode.single('Option.none()'),
    (a) => Pnode.pnode('Option.some(', [ pprintA.pprint(a) ], ')')
  )
);

export const eqOption = <A> (eqA: Eq<A> = Eq.eqAny): Eq<Option<A>> =>
  Eq.eq((oa, ob) => oa.equals_(ob, eqA.eq));

export const tOption = <A> (testableA: Testable<A> = Testable.tAny): Testable<Option<A>> =>
  Testable.testable(eqOption(testableA), pprintOption(testableA));
