import { Universe } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';

import * as Spot from '../api/data/Spot';
import { SpotPoints, Wrapter } from '../api/data/Types';
import * as Split from '../api/general/Split';
import * as Contiguous from '../util/Contiguous';
import * as Navigation from './Navigation';

type Group<E> = Contiguous.Group<E>;

/**
 * Wrap all text nodes between two DOM positions, using the nu() wrapper
 */
const wrapWith = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, nu: () => Wrapter<E>): E[] => {
  const nodes = Split.range(universe, base, baseOffset, end, endOffset);
  return wrapper(universe, nodes, nu);
};

/**
 * Wrap non-empty text nodes using the nu() wrapper
 */
const wrapper = <E, D>(universe: Universe<E, D>, wrapped: E[], nu: () => Wrapter<E>): E[] => {
  if (wrapped.length === 0) {
    return wrapped;
  }

  const filtered = Arr.filter(wrapped, (x) => {
    return universe.property().isText(x) && universe.property().getText(x).length > 0;
  });

  return Arr.map(filtered, (w) => {
    const container = nu();
    universe.insert().before(w, container.element);
    container.wrap(w);
    return container.element;
  });
};

/**
 * Return the cursor positions at the start and end of a collection of wrapper elements
 */
const endPoints = <E, D>(universe: Universe<E, D>, wrapped: E[]): Optional<SpotPoints<E>> => {
  return Optional.from(wrapped[0]).map((first) => {
    // INVESTIGATE: Should this one navigate to the next child when first isn't navigating down a level?
    const last = Navigation.toLower(universe, wrapped[wrapped.length - 1]);
    return Spot.points(
      Spot.point(first, 0),
      Spot.point(last.element, last.offset)
    );
  });
};

/**
 * Calls wrapWith() on text nodes in the range, and returns the end points
 */
const leaves = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, nu: () => Wrapter<E>): Optional<SpotPoints<E>> => {
  const start = Navigation.toLeaf(universe, base, baseOffset);
  const finish = Navigation.toLeaf(universe, end, endOffset);
  const wrapped = wrapWith(universe, start.element, start.offset, finish.element, finish.offset, nu);
  return endPoints(universe, wrapped);
};

/*
 * Returns a list of spans (reusing where possible) that wrap the text nodes within the range
 */
const reuse = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, predicate: (e: E) => boolean, nu: () => Wrapter<E>): E[] => {
  const start = Navigation.toLeaf(universe, base, baseOffset);
  const finish = Navigation.toLeaf(universe, end, endOffset);
  const nodes = Split.range(universe, start.element, start.offset, finish.element, finish.offset);

  const groups: Group<E>[] = Contiguous.textnodes(universe, nodes);

  const canReuse = (group: Group<E>) => {
    // TODO: Work out a sensible way to consider empty text nodes here.
    const children = universe.property().children(group.parent);
    return children.length === group.children.length && predicate(group.parent);
  };

  const recycle = (group: Group<E>) => {
    return group.parent;
  };

  const create = (group: Group<E>): E => {
    const container = nu();
    universe.insert().before(group.children[0], container.element);
    Arr.each(group.children, container.wrap);
    return container.element;
  };

  return Arr.map(groups, (group) => {
    // return parent if it can be reused (e.g. span with no other children), otherwise make a new one.
    const builder = canReuse(group) ? recycle : create;
    return builder(group);
  });
};

export {
  wrapWith,
  wrapper,
  leaves,
  reuse
};
