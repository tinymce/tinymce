import { Eq, Pnode, Pprint, Testable } from '@ephox/dispute';
import { Node as DomNode } from '@ephox/dom-globals';
import { Html } from '@ephox/sugar';
import Element from 'ephox/sugar/api/node/Element';

type Eq<A> = Eq.Eq<A>;
type Pprint<A> = Pprint.Pprint<A>;
type Testable<A> = Testable.Testable<A>;

export const eqElement = <T extends DomNode> (): Eq<Element<T>> =>
  Eq.contramap(Eq.tripleEq, (e) => e.dom());

export const pprintElement = <T extends DomNode> (): Pprint<Element<T>> =>
  Pprint.pprint<Element<T>>((e) => Pnode.single(Html.getOuter(e)));

export const tElement = <T extends DomNode> (): Testable<Element<T>> =>
  Testable.testable(eqElement(), pprintElement());
