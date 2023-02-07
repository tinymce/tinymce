import { Num, Optional } from '@ephox/katamari';
import { Attribute, SugarElement, SugarNode } from '@ephox/sugar';

import * as DomPinpoint from './DomPinpoint';

type GetNewIndex = <T>(
  prevIndex: number,
  value: number,
  delta: number,
  min: number,
  max: number,
  oldCandidate: T,
  onNewIndex: (newIndex: number) => Optional<T>
) => Optional<T>;

const f = (container: SugarElement<HTMLElement>, selector: string, current: SugarElement<HTMLElement>, delta: number, getNewIndex: GetNewIndex): Optional<SugarElement<HTMLElement>> => {
  const isDisabledButton = (candidate: SugarElement<HTMLElement>) =>
    SugarNode.name(candidate) === 'button' && Attribute.get(candidate, 'disabled') === 'disabled';

  const tryNewIndex = (initial: number, index: number, candidates: Array<SugarElement<HTMLElement>>): Optional<SugarElement<HTMLElement>> =>
    getNewIndex(initial, index, delta, 0, candidates.length - 1, candidates[index],
      (newIndex) => isDisabledButton(candidates[newIndex]) ?
        tryNewIndex(initial, newIndex, candidates) :
        Optional.from(candidates[newIndex])
    );

  // I wonder if this will be a problem when the focused element is invisible (shouldn't happen)
  return DomPinpoint.locateVisible(container, current, selector).bind((identified) => {
    const index = identified.index;
    const candidates = identified.candidates;
    return tryNewIndex(index, index, candidates);
  });
};

const horizontalWithoutCycles = (container: SugarElement<HTMLElement>, selector: string, current: SugarElement<HTMLElement>, delta: number): Optional<SugarElement<HTMLElement>> =>
  f(container, selector, current, delta, (prevIndex, v, d, min, max, oldCandidate, onNewIndex) => {
    const newIndex = Num.clamp(v + d, min, max);
    return newIndex === prevIndex ? Optional.from(oldCandidate) : onNewIndex(newIndex);
  });

const horizontal = (container: SugarElement<HTMLElement>, selector: string, current: SugarElement<HTMLElement>, delta: number): Optional<SugarElement<HTMLElement>> =>
  f(container, selector, current, delta, (prevIndex, v, d, min, max, _oldCandidate, onNewIndex) => {
    const newIndex = Num.cycleBy(v, d, min, max);
    // If we've cycled back to the original index, we've failed to find a new valid candidate
    return newIndex === prevIndex ? Optional.none() : onNewIndex(newIndex);
  });

export {
  horizontal,
  horizontalWithoutCycles
};
