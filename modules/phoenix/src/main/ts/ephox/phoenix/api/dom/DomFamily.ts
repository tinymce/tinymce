import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';
import * as Family from '../general/Family';

const universe = DomUniverse();

const range = function (start: SugarElement, startDelta: number, finish: SugarElement, finishDelta: number) {
  return Family.range(universe, start, startDelta, finish, finishDelta);
};

const group = function (elements: SugarElement[], optimise?: (e: SugarElement) => boolean) {
  return Family.group(universe, elements, optimise);
};

export {
  range,
  group
};
