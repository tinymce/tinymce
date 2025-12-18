import type { Universe } from '@ephox/boss';
import type { Optional } from '@ephox/katamari';

import { breakPath as xBreakPath, breakToLeft as xBreakToLeft, breakToRight as xBreakToRight, type BrokenPath, type LeftRight } from '../../parent/Breaker';
import { type Looker, oneAll } from '../../parent/Shared';
import * as SubsetFn from '../../parent/Subset';

type SubsetFn = <E, D>(universe: Universe<E, D>, start: E, end: E) => Optional<E[]>;

type AncestorsFn = <E, D>(universe: Universe<E, D>, start: E, finish: E, isRoot?: ((x: E) => boolean)) => AncestorsFnResult<E>;

type BreakToLeftFn = <E, D>(universe: Universe<E, D>, parent: E, child: E) => Optional<LeftRight<E>>;

type BreakToRightFn = <E, D>(universe: Universe<E, D>, parent: E, child: E) => Optional<LeftRight<E>>;

type BreakPathFn = <E, D>(universe: Universe<E, D>, child: E, isTop: (e: E) => boolean, breaker: (universe: Universe<E, D>, parent: E, child: E) => Optional<LeftRight<E>>) => BrokenPath<E>;

export interface AncestorsFnResult<E> {
  readonly firstpath: E[];
  readonly secondpath: E[];
  readonly shared: Optional<E>;
}

type SharedOneFn = <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[]) => Optional<E>;
const sharedOne: SharedOneFn = oneAll;

const subset: SubsetFn = SubsetFn.subset;

const ancestors: AncestorsFn = SubsetFn.ancestors;

const breakToLeft: BreakToLeftFn = xBreakToLeft;

const breakToRight: BreakToRightFn = xBreakToRight;

const breakPath: BreakPathFn = xBreakPath;

export {
  sharedOne,
  subset,
  ancestors,
  breakToLeft,
  breakToRight,
  breakPath
};