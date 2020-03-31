import { HTMLElement } from '@ephox/dom-globals';
import { Option, Num } from '@ephox/katamari';
import { Element, Attr, Node } from '@ephox/sugar';

import * as DomPinpoint from './DomPinpoint';

const horizontal = (container: Element<HTMLElement>, selector: string, current: Element<HTMLElement>, delta: number): Option<Element> => {

  const isDisabledButton = (candidate: Element<HTMLElement>) => Node.name(candidate) === 'button' && Attr.get(candidate, 'disabled') === 'disabled';

  const tryCycle = (initial: number, index: number, candidates: Array<Element<HTMLElement>>): Option<Element<HTMLElement>> => {
    const newIndex = Num.cycleBy(index, delta, 0, candidates.length - 1);
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
