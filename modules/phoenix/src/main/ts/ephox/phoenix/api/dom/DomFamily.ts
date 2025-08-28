import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';

import { TypedItem } from '../data/TypedItem';
import * as Family from '../general/Family';

const universe = DomUniverse();

const range = (start: SugarElement, startDelta: number, finish: SugarElement, finishDelta: number): SugarElement[] => {
  return Family.range(universe, start, startDelta, finish, finishDelta);
};

const group = (elements: SugarElement[], optimise?: (e: SugarElement) => boolean): TypedItem<SugarElement, Document>[][] => {
  return Family.group(universe, elements, optimise);
};

export {
  range,
  group
};
