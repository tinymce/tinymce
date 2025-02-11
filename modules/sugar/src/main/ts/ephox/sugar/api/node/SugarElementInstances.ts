import { Eq, Pnode, Pprint, Testable } from '@ephox/dispute';

import * as Html from '../properties/Html';
import { SugarElement } from './SugarElement';

type EqType<A> = Eq.Eq<A>;
type PprintType<A> = Pprint.Pprint<A>;
type TestableType<A> = Testable.Testable<A>;

export const eqElement = <T extends Node> (): EqType<SugarElement<T>> =>
  Eq.contramap(Eq.tripleEq, (e) => e.dom);

export const pprintElement = <T extends Node> (): PprintType<SugarElement<T>> =>
  Pprint.pprint<SugarElement<T>>((e) => Pnode.single(Html.getOuter(e)));

export const tElement = <T extends Node> (): TestableType<SugarElement<T>> =>
  Testable.testable(eqElement(), pprintElement());
