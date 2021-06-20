import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';

import { SplitPosition } from '../data/SplitPosition';
import { TextSplit } from '../data/TextSplit';
import { SpotRange } from '../data/Types';
import * as Split from '../general/Split';

const universe = DomUniverse();

const split = (element: SugarElement, position: number): TextSplit<SugarElement> => {
  return Split.split(universe, element, position);
};

const splitByPair = (element: SugarElement, start: number, finish: number): SugarElement => {
  return Split.splitByPair(universe, element, start, finish);
};

const range = (start: SugarElement, startOffset: number, finish: SugarElement, finishOffset: number): SugarElement[] => {
  return Split.range(universe, start, startOffset, finish, finishOffset);
};

const subdivide = (element: SugarElement, positions: number[]): SpotRange<SugarElement>[] => {
  return Split.subdivide(universe, element, positions);
};

const position = (target: TextSplit<SugarElement>): SplitPosition<SugarElement> => {
  return Split.position(universe, target);
};

export {
  split,
  splitByPair,
  range,
  subdivide,
  position
};
