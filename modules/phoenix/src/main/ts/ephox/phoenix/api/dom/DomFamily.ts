import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import * as Family from '../general/Family';

const universe = DomUniverse();

const range = function (start: Element, startDelta: number, finish: Element, finishDelta: number) {
  return Family.range(universe, start, startDelta, finish, finishDelta);
};

const group = function (elements: Element[], optimise?: (e: Element) => boolean) {
  return Family.group(universe, elements, optimise);
};

export {
  range,
  group
};