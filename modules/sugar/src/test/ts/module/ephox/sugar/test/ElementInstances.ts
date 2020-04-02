import Element from 'ephox/sugar/api/node/Element';
import { Node as DomNode } from '@ephox/dom-globals';
import { Html } from '@ephox/sugar';
import { Eq, Pprint, Pnode, Testable } from '@ephox/dispute';

type Eq<A> = Eq.Eq<A>;
type Pprint<A> = Pprint.Pprint<A>;
type Testable<A> = Testable.Testable<A>;

export const eqElement: Eq<Element<DomNode>> = Eq.contramap(Eq.tripleEq, (e) => e.dom());

export const pprintElement: Pprint<Element<DomNode>> = Pprint.pprint<Element<DomNode>>((e) => Pnode.single(Html.getOuter(e)));

export const tElement: Testable<Element<DomNode>> = Testable.testable(eqElement, pprintElement);
