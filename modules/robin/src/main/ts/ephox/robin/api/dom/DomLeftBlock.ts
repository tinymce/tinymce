import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';

import * as LeftBlock from '../general/LeftBlock';

const universe = DomUniverse();

const top = (item: SugarElement): SugarElement[] => {
  return LeftBlock.top(universe, item);
};

const all = (item: SugarElement): SugarElement[] => {
  return LeftBlock.all(universe, item);
};

export {
  top,
  all
};
