import { Fun, Option } from '@ephox/katamari';

import * as Cycles from '../alien/Cycles';
import * as DomPinpoint from './DomPinpoint';

const horizontal = (container, selector, current, delta) => {
  // I wonder if this will be a problem when the focused element is invisible (shouldn't happen)
  return DomPinpoint.locateVisible(container, current, selector).bind((identified) => {
    const index = identified.index();
    const candidates = identified.candidates();
    const newIndex = Cycles.cycleBy(index, delta, 0, candidates.length - 1);
    return Option.from(candidates[newIndex]);
  });
};

export {
  horizontal
};