import { Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';

export type Placement = 'north' | 'northeast' | 'northwest' | 'south' | 'southeast' | 'southwest' | 'east' | 'west';

const north = 'north' as const;
const northeast = 'northeast' as const;
const northwest = 'northwest' as const;
const south = 'south' as const;
const southeast = 'southeast' as const;
const southwest = 'southwest' as const;
const east = 'east' as const;
const west = 'west' as const;

const placementAttribute = 'data-alloy-placement';

const setPlacement = (element: SugarElement<HTMLElement>, placement: Placement): void => {
  Attribute.set(element, placementAttribute, placement);
};

const getPlacement = (element: SugarElement<HTMLElement>): Optional<Placement> =>
  Attribute.getOpt(element, placementAttribute) as Optional<Placement>;

export {
  north,
  northeast,
  northwest,
  south,
  southeast,
  southwest,
  east,
  west,

  setPlacement,
  getPlacement
};
