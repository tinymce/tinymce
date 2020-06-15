import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import { Direction, Successor, Transition } from '../data/Types';
import * as Gather from '../general/Gather';

const universe = DomUniverse();

const before = function (element: Element, isRoot: (e: Element) => boolean) {
  return Gather.before(universe, element, isRoot);
};

const after = function (element: Element, isRoot: (e: Element) => boolean) {
  return Gather.after(universe, element, isRoot);
};

const seekLeft = function (element: Element, predicate: (e: Element) => boolean, isRoot: (e: Element) => boolean) {
  return Gather.seekLeft(universe, element, predicate, isRoot);
};

const seekRight = function (element: Element, predicate: (e: Element) => boolean, isRoot: (e: Element) => boolean) {
  return Gather.seekRight(universe, element, predicate, isRoot);
};

const walkers = Gather.walkers;

const walk = function (item: Element, mode: Transition, direction: Direction, rules?: Successor[]) {
  return Gather.walk(universe, item, mode, direction, rules);
};

export {
  before,
  after,
  seekLeft,
  seekRight,
  walkers,
  walk
};