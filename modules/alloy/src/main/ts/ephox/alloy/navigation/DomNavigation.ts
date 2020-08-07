import { Num, Optional } from '@ephox/katamari';
import { Attribute, SugarElement, SugarNode } from '@ephox/sugar';

import * as DomPinpoint from './DomPinpoint';

const horizontal = (container: SugarElement<HTMLElement>, selector: string, current: SugarElement<HTMLElement>, delta: number): Optional<SugarElement> => {

  const isDisabledButton = (candidate: SugarElement<HTMLElement>) =>
    SugarNode.name(candidate) === 'button' && Attribute.get(candidate, 'disabled') === 'disabled';

  const tryCycle = (initial: number, index: number, candidates: Array<SugarElement<HTMLElement>>): Optional<SugarElement<HTMLElement>> => {
    const newIndex = Num.cycleBy(index, delta, 0, candidates.length - 1);
    if (newIndex === initial) { // If we've cycled back to the original index, we've failed to find a new valid candidate
      return Optional.none();
    } else {
      return isDisabledButton(candidates[newIndex]) ?
        tryCycle(initial, newIndex, candidates) :
        Optional.from(candidates[newIndex]);
    }
  };

  // I wonder if this will be a problem when the focused element is invisible (shouldn't happen)
  return DomPinpoint.locateVisible(container, current, selector).bind((identified) => {
    const index = identified.index;
    const candidates = identified.candidates;
    return tryCycle(index, index, candidates);
  });
};

export {
  horizontal
};
