import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import { breakPath as xBreakPath, breakToLeft as xBreakToLeft, breakToRight as xBreakToRight, BrokenPath, LeftRight } from '../../parent/Breaker';
import { Looker, oneAll } from '../../parent/Shared';
import SubsetFn from '../../parent/Subset';

type SharedOneFn = <E, D> (universe: Universe<E, D>, look: Looker<E, D>, elements: E[]) => Option<E>;
const sharedOne: SharedOneFn = oneAll;

type SubsetFn = <E, D>(universe: Universe<E, D>, start: E, end: E) => Option<E[]>;
const subset: SubsetFn = SubsetFn.subset;

type AncestorsFnResult<E> = {
  firstpath: () => E[];
  secondpath: () => E[];
  shared: () => Option<E>;
};
type AncestorsFn = <E, D>(universe: Universe<E, D>, start: E, finish: E, isRoot?: ((x: E) => boolean) | undefined) => AncestorsFnResult<E>;
const ancestors: AncestorsFn = SubsetFn.ancestors;

type BreakToLeftFn = <E, D>(universe: Universe<E, D>, parent: E, child: E) => Option<LeftRight<E>>;
const breakToLeft: BreakToLeftFn = xBreakToLeft;

type BreakToRightFn = <E, D>(universe: Universe<E, D>, parent: E, child: E) => Option<LeftRight<E>>;
const breakToRight: BreakToRightFn = xBreakToRight;

type BreakPathFn = <E, D>(universe: Universe<E, D>, child: E, isTop: (e: E) => boolean, breaker: (universe: Universe<E, D>, parent: E, child: E) => Option<LeftRight<E>>) => BrokenPath<E>;
const breakPath: BreakPathFn = xBreakPath;

export default {
  sharedOne,
  subset,
  ancestors,
  breakToLeft,
  breakToRight,
  breakPath
};