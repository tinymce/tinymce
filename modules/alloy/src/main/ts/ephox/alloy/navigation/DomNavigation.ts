import { Option } from '@ephox/katamari';

import * as Cycles from '../alien/Cycles';
import * as DomPinpoint from './DomPinpoint';
import { Element, Attr, Node } from '@ephox/sugar';

const horizontal = (container, selector, current, delta): Option<Element> => {

  const isDisabledButton = (candidate) => {
    return Node.name(candidate) === 'button' && Attr.get(candidate, 'disabled') === 'disabled';
  };

  const tryCycle = (initial, index, candidates) => {
    const newIndex = Cycles.cycleBy(index, delta, 0, candidates.length - 1);
    if (newIndex === initial) { // If we've cycled back to the original index, we've failed to find a new valid candidate
      return Option.none();
    } else {
      return isDisabledButton(candidates[newIndex]) ?
        tryCycle(initial, newIndex, candidates) :
        Option.from(candidates[newIndex]);
    }
  };

  // I wonder if this will be a problem when the focused element is invisible (shouldn't happen)
  return DomPinpoint.locateVisible(container, current, selector).bind((identified) => {
    const index = identified.index();
    const candidates = identified.candidates();
    return tryCycle(index, index, candidates);
  });
};

export {
  horizontal
};
