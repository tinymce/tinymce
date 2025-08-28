import { Universe } from '@ephox/boss';

import * as Splitter from '../../search/Splitter';
import * as Positions from '../../split/Positions';
import * as Range from '../../split/Range';
import * as Split from '../../split/Split';
import { SplitPosition } from '../data/SplitPosition';
import { TextSplit } from '../data/TextSplit';
import { SpotRange } from '../data/Types';

type SplitApi = <E, D>(universe: Universe<E, D>, item: E, position: number) => TextSplit<E>;
const split: SplitApi = Split.split;

type SplitByPairApi = <E, D>(universe: Universe<E, D>, item: E, start: number, end: number) => E;
const splitByPair: SplitByPairApi = Split.splitByPair;

type RangeApi = <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number) => E[];
const range: RangeApi = Range.nodes;

type SubdivideApi = <E, D>(universe: Universe<E, D>, item: E, positions: number[]) => SpotRange<E>[];
const subdivide: SubdivideApi = Splitter.subdivide;

type PositionApi = <E, D>(_universe: Universe<E, D>, target: TextSplit<E>) => SplitPosition<E>;
const position: PositionApi = (_universe, target) => Positions.determine(target);

export {
  split,
  splitByPair,
  range,
  subdivide,
  position
};
