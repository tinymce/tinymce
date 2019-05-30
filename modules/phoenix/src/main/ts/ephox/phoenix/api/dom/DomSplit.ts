import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import { TextSplit } from '../data/TextSplit';
import * as Split from '../general/Split';

const universe = DomUniverse();

const split = function (element: Element, position: number) {
  return Split.split(universe, element, position);
};

const splitByPair = function (element: Element, start: number, finish: number) {
  return Split.splitByPair(universe, element, start, finish);
};

const range = function (start: Element, startOffset: number, finish: Element, finishOffset: number) {
  return Split.range(universe, start, startOffset, finish, finishOffset);
};

const subdivide = function (element: Element, positions: number[]) {
  return Split.subdivide(universe, element, positions);
};

const position = function (target: TextSplit<Element>) {
  return Split.position(universe, target);
};

export {
  split,
  splitByPair,
  range,
  subdivide,
  position
};