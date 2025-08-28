import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Gather, Transition } from '@ephox/phoenix';

import { WordDecision, WordDecisionItem } from './WordDecision';
import { WordWalking } from './WordWalking';

/*
 * Identification of words:
 *
 * For boundaries, stop the gathering process and do not include
 * For empty tags, stop the gathering process and do not include
 * For items satisfying the custom boundary, stop the gathering process and do not include. This is
 * often a language boundary function.
 * For text nodes:
 *   a) text node has a character break, stop the gathering process and include partial
 *   b) text node has no character breaks, keep gathering and include entire node
 *
 * These rules are encoded in WordDecision.decide
 * Returns: [WordDecision.make Struct] of all the words recursively from item in direction.
 */
const doWords = <E, D>(universe: Universe<E, D>, item: E, mode: Transition, direction: WordWalking, isCustomBoundary: (universe: Universe<E, D>, item: E) => boolean): WordDecisionItem<E>[] => {
  const destination = Gather.walk(universe, item, mode, direction);
  const result = destination.map((dest) => {
    const decision = WordDecision.decide(universe, dest.item, direction.slicer, isCustomBoundary);
    const recursive: WordDecisionItem<E>[] = decision.abort ? [] : doWords(universe, dest.item, dest.mode, direction, isCustomBoundary);
    return decision.items.concat(recursive);
  }).getOr([]);

  return Arr.filter(result, (res) => {
    return res.text.trim().length > 0;
  });
};

const creepLeft = <E, D>(universe: Universe<E, D>, item: E, isCustomBoundary: (universe: Universe<E, D>, item: E) => boolean): WordDecisionItem<E>[] => {
  return doWords(universe, item, Gather.sidestep, WordWalking.left, isCustomBoundary);
};

const creepRight = <E, D>(universe: Universe<E, D>, item: E, isCustomBoundary: (universe: Universe<E, D>, item: E) => boolean): WordDecisionItem<E>[] => {
  return doWords(universe, item, Gather.sidestep, WordWalking.right, isCustomBoundary);
};

const isEmpty = <E, D>(universe: Universe<E, D>, item: E): boolean => {
  // Empty if there are no text nodes in self or any descendants.
  return universe.property().isText(item) ? false : universe.down().predicate(item, universe.property().isText).length === 0;
};

const flatten = <E, D>(universe: Universe<E, D>, item: E): WordDecisionItem<E>[] => {
  return universe.property().isText(item) ? [ WordDecision.detail(universe, item) ] : Arr.map(
    universe.down().predicate(item, universe.property().isText),
    (e) => {
      return WordDecision.detail(universe, e);
    }
  );
};

export {
  creepLeft,
  creepRight,
  flatten,
  isEmpty
};
