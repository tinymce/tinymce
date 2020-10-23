import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';
import { Direction, Successor, Transition } from '../data/Types';
import * as Gather from '../general/Gather';

const universe = DomUniverse();

const before = function (element: SugarElement, isRoot: (e: SugarElement) => boolean) {
  return Gather.before(universe, element, isRoot);
};

const after = function (element: SugarElement, isRoot: (e: SugarElement) => boolean) {
  return Gather.after(universe, element, isRoot);
};

const seekLeft = function (element: SugarElement, predicate: (e: SugarElement) => boolean, isRoot: (e: SugarElement) => boolean) {
  return Gather.seekLeft(universe, element, predicate, isRoot);
};

const seekRight = function (element: SugarElement, predicate: (e: SugarElement) => boolean, isRoot: (e: SugarElement) => boolean) {
  return Gather.seekRight(universe, element, predicate, isRoot);
};

const walkers = Gather.walkers;

const walk = function (item: SugarElement, mode: Transition, direction: Direction, rules?: Successor[]) {
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
