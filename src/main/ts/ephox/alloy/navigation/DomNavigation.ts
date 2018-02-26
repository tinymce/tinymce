import { Fun, Option } from '@ephox/katamari';

import * as Cycles from '../alien/Cycles';
import DomPinpoint from './DomPinpoint';

const horizontal = function (container, selector, current, delta) {
  // I wonder if this will be a problem when the focused element is invisible (shouldn't happen)
  return DomPinpoint.locateVisible(container, current, selector, Fun.constant(true)).bind(function (identified) {
    const index = identified.index();
    const candidates = identified.candidates();
    const newIndex = Cycles.cycleBy(index, delta, 0, candidates.length - 1);
    return Option.from(candidates[newIndex]);
  });
};

export {
  horizontal
};