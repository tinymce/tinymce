import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';

import { Textdata } from '../general/Textdata';

const universe = DomUniverse();

const from = (elements: SugarElement[], current: SugarElement, offset: number): Textdata<SugarElement> => {
  return Textdata.from(universe, elements, current, offset);
};

export {
  from
};
