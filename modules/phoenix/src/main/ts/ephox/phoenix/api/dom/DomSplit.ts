import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';
import { TextSplit } from '../data/TextSplit';
import * as Split from '../general/Split';

const universe = DomUniverse();

const split = function (element: SugarElement, position: number) {
  return Split.split(universe, element, position);
};

const splitByPair = function (element: SugarElement, start: number, finish: number) {
  return Split.splitByPair(universe, element, start, finish);
};

const range = function (start: SugarElement, startOffset: number, finish: SugarElement, finishOffset: number) {
  return Split.range(universe, start, startOffset, finish, finishOffset);
};

const subdivide = function (element: SugarElement, positions: number[]) {
  return Split.subdivide(universe, element, positions);
};

const position = function (target: TextSplit<SugarElement>) {
  return Split.position(universe, target);
};

export {
  split,
  splitByPair,
  range,
  subdivide,
  position
};
