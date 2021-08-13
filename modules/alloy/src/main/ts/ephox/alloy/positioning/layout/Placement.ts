import { Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';

export const enum Placement {
  North = 'north',
  Northeast = 'northeast',
  Northwest = 'northwest',
  South = 'south',
  Southeast = 'southeast',
  Southwest = 'southwest',
  East = 'east',
  West = 'west'
}

const placementAttribute = 'data-alloy-placement';

const setPlacement = (element: SugarElement<HTMLElement>, placement: Placement): void => {
  Attribute.set(element, placementAttribute, placement);
};

const getPlacement = (element: SugarElement<HTMLElement>): Optional<Placement> =>
  Attribute.getOpt(element, placementAttribute) as Optional<Placement>;

const reset = (element: SugarElement<HTMLElement>): void =>
  Attribute.remove(element, placementAttribute);

export {
  setPlacement,
  getPlacement,
  reset
};
