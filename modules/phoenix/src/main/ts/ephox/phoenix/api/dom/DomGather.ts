import { DomUniverse } from '@ephox/boss';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { Direction, Successor, Transition, Traverse } from '../data/Types';
import * as Gather from '../general/Gather';

const universe = DomUniverse();

const before = (element: SugarElement, isRoot: (e: SugarElement) => boolean): Optional<SugarElement> => {
  return Gather.before(universe, element, isRoot);
};

const after = (element: SugarElement, isRoot: (e: SugarElement) => boolean): Optional<SugarElement> => {
  return Gather.after(universe, element, isRoot);
};

const seekLeft = (element: SugarElement, predicate: (e: SugarElement) => boolean, isRoot: (e: SugarElement) => boolean): Optional<SugarElement> => {
  return Gather.seekLeft(universe, element, predicate, isRoot);
};

const seekRight = (element: SugarElement, predicate: (e: SugarElement) => boolean, isRoot: (e: SugarElement) => boolean): Optional<SugarElement> => {
  return Gather.seekRight(universe, element, predicate, isRoot);
};

const walkers = Gather.walkers;

const walk = (item: SugarElement, mode: Transition, direction: Direction, rules?: Successor[]): Optional<Traverse<SugarElement>> => {
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
