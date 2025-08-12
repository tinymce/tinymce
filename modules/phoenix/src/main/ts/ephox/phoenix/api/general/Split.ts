import type { Universe } from '@ephox/boss';

import * as Splitter from '../../search/Splitter';
import * as Positions from '../../split/Positions';
import * as Range from '../../split/Range';
import * as Split from '../../split/Split';
import type { SplitPosition } from '../data/SplitPosition';
import type { TextSplit } from '../data/TextSplit';
import type { SpotRange } from '../data/Types';

type SplitByPairApi = <E, D>(universe: Universe<E, D>, item: E, start: number, end: number) => E;

type RangeApi = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number) => E[];

type SubdivideApi = <E, D>(universe: Universe<E, D>, item: E, positions: number[]) => SpotRange<E>[];

type PositionApi = <E, D>(_universe: Universe<E, D>, target: TextSplit<E>) => SplitPosition<E>;

type SplitApi = <E, D>(universe: Universe<E, D>, item: E, position: number) => TextSplit<E>;
const split: SplitApi = Split.split;

const splitByPair: SplitByPairApi = Split.splitByPair;

const range: RangeApi = Range.nodes;

const subdivide: SubdivideApi = Splitter.subdivide;

const position: PositionApi = (_universe, target) => Positions.determine(target);

export {
  split,
  splitByPair,
  range,
  subdivide,
  position
};