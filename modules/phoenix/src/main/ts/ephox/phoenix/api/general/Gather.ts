import { Universe } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

import * as Seeker from '../../gather/Seeker';
import { advance, backtrack, go, sidestep } from '../../gather/Walker';
import { Walkers } from '../../gather/Walkers';
import { Direction, Successor, Transition, Traverse } from '../data/Types';

const isLeaf = <E, D>(universe: Universe<E, D>) => (element: E) => universe.property().children(element).length === 0;

type BeforeApi = <E, D>(universe: Universe<E, D>, item: E, isRoot: (e: E) => boolean) => Optional<E>;
const before: BeforeApi = (universe, item, isRoot) => {
  return seekLeft(universe, item, isLeaf(universe), isRoot);
};

type AfterApi = <E, D>(universe: Universe<E, D>, item: E, isRoot: (e: E) => boolean) => Optional<E>;
const after: AfterApi = (universe, item, isRoot) => {
  return seekRight(universe, item, isLeaf(universe), isRoot);
};

type SeekLeftApi = <E, D>(universe: Universe<E, D>, item: E, predicate: (e: E) => boolean, isRoot: (e: E) => boolean) => Optional<E>;
const seekLeft: SeekLeftApi = Seeker.left;

type SeekRightApi = <E, D>(universe: Universe<E, D>, item: E, predicate: (e: E) => boolean, isRoot: (e: E) => boolean) => Optional<E>;
const seekRight: SeekRightApi = Seeker.right;

type WalkersApi = () => { left: () => Direction; right: () => Direction };
const walkers: WalkersApi = () => ({ left: Walkers.left, right: Walkers.right });

type WalkApi = <E, D>(universe: Universe<E, D>, item: E, mode: Transition, direction: Direction, rules?: Successor[]) => Optional<Traverse<E>>;
const walk: WalkApi = go;

export {
  before,
  after,
  seekLeft,
  seekRight,
  walkers,
  walk,
  // These have to be direct references.
  backtrack,
  sidestep,
  advance
};
