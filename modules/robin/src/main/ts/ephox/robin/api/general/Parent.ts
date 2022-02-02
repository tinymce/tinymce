import { Universe } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

import { breakPath as xBreakPath, breakToLeft as xBreakToLeft, breakToRight as xBreakToRight, BrokenPath, LeftRight } from '../../parent/Breaker';
import { Looker, oneAll } from '../../parent/Shared';
import * as SubsetFn from '../../parent/Subset';

export interface AncestorsFnResult<E> {
  readonly firstpath: E[];
  readonly secondpath: E[];
  readonly shared: Optional<E>;
}

type SharedOneFn = <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[]) => Optional<E>;
const sharedOne: SharedOneFn = oneAll;

type SubsetFn = <E, D>(universe: Universe<E, D>, start: E, end: E) => Optional<E[]>;
const subset: SubsetFn = SubsetFn.subset;

type AncestorsFn = <E, D>(universe: Universe<E, D>, start: E, finish: E, isRoot?: ((x: E) => boolean) | undefined) => AncestorsFnResult<E>;
const ancestors: AncestorsFn = SubsetFn.ancestors;

type BreakToLeftFn = <E, D>(universe: Universe<E, D>, parent: E, child: E) => Optional<LeftRight<E>>;
const breakToLeft: BreakToLeftFn = xBreakToLeft;

type BreakToRightFn = <E, D>(universe: Universe<E, D>, parent: E, child: E) => Optional<LeftRight<E>>;
const breakToRight: BreakToRightFn = xBreakToRight;

type BreakPathFn = <E, D>(universe: Universe<E, D>, child: E, isTop: (e: E) => boolean, breaker: (universe: Universe<E, D>, parent: E, child: E) => Optional<LeftRight<E>>) => BrokenPath<E>;
const breakPath: BreakPathFn = xBreakPath;

export {
  sharedOne,
  subset,
  ancestors,
  breakToLeft,
  breakToRight,
  breakPath
};
