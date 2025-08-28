import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';

import { SpotPoint } from '../data/Types';
import * as Descent from '../general/Descent';

const universe = DomUniverse();
const toLeaf = (element: SugarElement, offset: number): SpotPoint<SugarElement> => {
  return Descent.toLeaf(universe, element, offset);
};

/* The purpose of freefall is that they will land on an element that is not whitespace text. This
 * can be very useful inside beautified content
 */
const freefallLtr = (element: SugarElement): SpotPoint<SugarElement> => {
  return Descent.freefallLtr(universe, element);
};

const freefallRtl = (element: SugarElement): SpotPoint<SugarElement> => {
  return Descent.freefallRtl(universe, element);
};

export {
  toLeaf,
  freefallLtr,
  freefallRtl
};
