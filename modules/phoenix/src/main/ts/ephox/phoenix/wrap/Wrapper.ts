import { Universe } from '@ephox/boss';
import { Arr, Option } from '@ephox/katamari';
import * as Spot from '../api/data/Spot';
import { Wrapter } from '../api/data/Types';
import * as Split from '../api/general/Split';
import * as Contiguous from '../util/Contiguous';
import * as Navigation from './Navigation';

/**
 * Wrap all text nodes between two DOM positions, using the nu() wrapper
 */
const wrapWith = function <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, nu: () => Wrapter<E>) {
  const nodes = Split.range(universe, base, baseOffset, end, endOffset);
  return wrapper(universe, nodes, nu);
};

/**
 * Wrap non-empty text nodes using the nu() wrapper
 */
const wrapper = function <E, D>(universe: Universe<E, D>, wrapped: E[], nu: () => Wrapter<E>): E[] {
  if (wrapped.length === 0) {
    return wrapped;
  }

  const filtered = Arr.filter(wrapped, function (x) {
    return universe.property().isText(x) && universe.property().getText(x).length > 0;
  });

  return Arr.map(filtered, function (w) {
    const container = nu();
    universe.insert().before(w, container.element());
    container.wrap(w);
    return container.element();
  });
};

/**
 * Return the cursor positions at the start and end of a collection of wrapper elements
 */
const endPoints = function <E, D>(universe: Universe<E, D>, wrapped: E[]) {
  return Option.from(wrapped[0]).map(function (first) {
    // INVESTIGATE: Should this one navigate to the next child when first isn't navigating down a level?
    const last = Navigation.toLower(universe, wrapped[wrapped.length - 1]);
    return Spot.points(
      Spot.point(first, 0),
      Spot.point(last.element(), last.offset())
    );
  });
};

/**
 * Calls wrapWith() on text nodes in the range, and returns the end points
 */
const leaves = function <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, nu: () => Wrapter<E>) {
  const start = Navigation.toLeaf(universe, base, baseOffset);
  const finish = Navigation.toLeaf(universe, end, endOffset);
  const wrapped = wrapWith(universe, start.element(), start.offset(), finish.element(), finish.offset(), nu);
  return endPoints(universe, wrapped);
};

interface Group<E> {
  parent: E;
  children: E[];
}

/*
 * Returns a list of spans (reusing where possible) that wrap the text nodes within the range
 */
const reuse = function <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number, predicate: (e: E) => boolean, nu: () => Wrapter<E>) {
  const start = Navigation.toLeaf(universe, base, baseOffset);
  const finish = Navigation.toLeaf(universe, end, endOffset);
  const nodes = Split.range(universe, start.element(), start.offset(), finish.element(), finish.offset());

  const groups: Group<E>[] = Contiguous.textnodes(universe, nodes);

  const canReuse = function (group: Group<E>) {
    // TODO: Work out a sensible way to consider empty text nodes here.
    const children = universe.property().children(group.parent);
    return children.length === group.children.length && predicate(group.parent);
  };

  const recycle = function (group: Group<E>) {
    return group.parent;
  };

  const create = function (group: Group<E>): E {
    const container = nu();
    universe.insert().before(group.children[0], container.element());
    Arr.each(group.children, container.wrap);
    return container.element();
  };

  return Arr.map(groups, function (group) {
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
