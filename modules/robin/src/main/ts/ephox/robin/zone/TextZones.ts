import { Universe } from '@ephox/boss';
import { Fun, Optional } from '@ephox/katamari';

import * as Parent from '../api/general/Parent';
import { ZoneViewports } from '../api/general/ZoneViewports';
import * as Clustering from '../words/Clustering';
import { WordDecision, WordDecisionItem } from '../words/WordDecision';
import { LanguageZones, ZoneDetails } from './LanguageZones';
import * as Zones from './Zones';
import * as ZoneWalker from './ZoneWalker';

type Zones<E> = Zones.Zones<E>;

const rangeOn = <E, D>(universe: Universe<E, D>, first: E, last: E, envLang: string, transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>, viewport: ZoneViewports<E>): Optional<ZoneDetails<E>[]> => {
  const ancestor = universe.eq(first, last) ? Optional.some(first) : universe.property().parent(first);
  return ancestor.map((parent) => {
    const defaultLang = LanguageZones.calculate(universe, parent).getOr(envLang);
    return ZoneWalker.walk(universe, first, last, defaultLang, transform, viewport);
  });
};

const fromBoundedWith = <E, D>(universe: Universe<E, D>, left: E, right: E, envLang: string, transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>, viewport: ZoneViewports<E>): Zones<E> => {
  const groups: ZoneDetails<E>[] = Parent.subset(universe, left, right).bind((children) => {
    if (children.length === 0) {
      return Optional.none<ZoneDetails<E>[]>();
    }
    const first = children[0];
    const last = children[children.length - 1];
    return rangeOn(universe, first, last, envLang, transform, viewport);
  }).getOr([]);

  return Zones.fromWalking(universe, groups);
};

const fromBounded = <E, D>(universe: Universe<E, D>, left: E, right: E, envLang: string, viewport: ZoneViewports<E>): Zones<E> => {
  return fromBoundedWith(universe, left, right, envLang, WordDecision.detail, viewport);
};

const fromRange = <E, D>(universe: Universe<E, D>, start: E, finish: E, envLang: string, viewport: ZoneViewports<E>): Zones<E> => {
  const edges = Clustering.getEdges(universe, start, finish, Fun.never);
  const transform = transformEdges(edges.left, edges.right);
  return fromBoundedWith(universe, edges.left.item, edges.right.item, envLang, transform, viewport);
};

const transformEdges = <E>(leftEdge: WordDecisionItem<E>, rightEdge: WordDecisionItem<E>) => {
  return <D> (universe: Universe<E, D>, element: E): WordDecisionItem<E> => {
    if (universe.eq(element, leftEdge.item)) {
      return leftEdge;
    } else if (universe.eq(element, rightEdge.item)) {
      return rightEdge;
    } else {
      return WordDecision.detail(universe, element);
    }
  };
};

const fromInline = <E, D>(universe: Universe<E, D>, element: E, envLang: string, viewport: ZoneViewports<E>): Zones<E> => {
  // Create a cluster that branches to the edge of words, and then apply the zones. We will move
  // past language boundaries, because we might need to be retokenizing words post a language
  // change
  const bounded = Clustering.byBoundary(universe, element);
  const transform = transformEdges(bounded.left, bounded.right);
  return bounded.isEmpty ? empty<E>() : fromBoundedWith(universe, bounded.left.item, bounded.right.item, envLang, transform, viewport);
};

const empty = <E>(): Zones<E> => {
  return {
    zones: []
  };
};

export {
  fromRange,
  transformEdges,
  fromBounded,
  fromBoundedWith,
  fromInline,
  empty
};
