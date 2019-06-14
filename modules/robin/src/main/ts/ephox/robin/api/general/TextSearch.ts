import { Contracts, Fun, Option } from '@ephox/katamari';
import { Gather, Spot, SpotPoint } from '@ephox/phoenix';
import { TextSearch as TextSearchBase } from '../../textdata/TextSearch';
import { TextSeeker, TextSeekerPhaseProcessor, TextSeekerPhase, TextSeekerPhaseConstructor } from '../../textdata/TextSeeker';
import { Universe } from '@ephox/boss';

export interface TextSearchSeeker {
  regex: () => RegExp;
  attempt: <E> (phase: TextSeekerPhaseConstructor, item: E, text: string, index: number) => TextSeekerPhase<E>;
}

const seekerSig = Contracts.exactly(['regex', 'attempt']);

const previousChar = function (text: string, offset: Option<number>) {
  return TextSearchBase.previous(text, offset);
};

const nextChar = function (text: string, offset: Option<number>) {
  return TextSearchBase.next(text, offset);
};

// Returns: a TextSeeker outcome ADT of 'aborted', 'success', or 'edge'.
// 'success' returns a point {element, offset} to the left of (item, offset)
// successfully found using a process function.
// 'edge' returns the text element where the process stopped due to being adjacent to a
// block boundary.
const repeatLeft = function <E, D> (universe: Universe<E, D>, item: E, offset: number, process: TextSeekerPhaseProcessor<E, D>) {
  return TextSeeker.repeatLeft(universe, item, offset, process);
};

// Returns: a TextSeeker outcome ADT of 'aborted', 'success', or 'edge'.
// 'success' returns a point {element, offset} to the right of (item, offset)
// successfully found using a process function.
// 'edge' returns the text element where the process stopped due to being adjacent to a
// block boundary.
const repeatRight = function <E, D> (universe: Universe<E, D>, item: E, offset: number, process: TextSeekerPhaseProcessor<E, D>) {
  return TextSeeker.repeatRight(universe, item, offset, process);
};

// Returns: a TextSeeker outcome ADT of 'aborted', 'success', or 'edge'.
// 'success' returns a point {element, offset} to the left of (item, offset)
// successfully found using a regular expression (rawSeeker object) on the text content.
// 'edge' returns the text element where the search stopped due to being adjacent to a
// block boundary.
const expandLeft = function <E, D> (universe: Universe<E, D>, item: E, offset: number, rawSeeker: TextSearchSeeker) {
  const seeker = seekerSig(rawSeeker);

  const process: TextSeekerPhaseProcessor<E, D> = function (uni, phase, pItem, pText, pOffset) {
    const lastOffset = pOffset.getOr(pText.length);
    return TextSearchBase.rfind(pText.substring(0, lastOffset), seeker.regex()).fold(function () {
      // Did not find a word break, so continue;
      return phase.kontinue<E>();
    }, function (index) {
      return seeker.attempt(phase, pItem, pText, index);
    });
  };
  return repeatLeft(universe, item, offset, process);
};

// Returns: a TextSeeker outcome ADT of 'aborted', 'success', or 'edge'.
// 'success' returns a point {element, offset} to the right of (item, offset)
// successfully found using a regular expression (rawSeeker object) on the text content.
// 'edge' returns the text element where the search stopped due to being adjacent to a
// block boundary.
const expandRight = function <E, D> (universe: Universe<E, D>, item: E, offset: number, rawSeeker: TextSearchSeeker) {
  const seeker = seekerSig(rawSeeker);

  const process: TextSeekerPhaseProcessor<E, D> = function (uni, phase, pItem, pText, pOffset) {
    const firstOffset = pOffset.getOr(0);
    const optPos = TextSearchBase.lfind(pText.substring(firstOffset), seeker.regex());
    return optPos.fold(function () {
      // Did not find a word break, so continue;
      return phase.kontinue();
    }, function (index) {
      return seeker.attempt(phase, pItem, pText, firstOffset + index);
    });
  };

  return repeatRight(universe, item, offset, process);
};

// Identify the (element, offset) pair ignoring potential fragmentation. Follow the offset
// through until the offset left is 0. This is designed to find text node positions that
// have been fragmented.
const scanRight = function <E, D> (universe: Universe<E, D>, item: E, originalOffset: number): Option<SpotPoint<E>> {
  const isRoot = Fun.constant(false);
  if (!universe.property().isText(item)) { return Option.none(); }
  const text = universe.property().getText(item);
  if (originalOffset <= text.length) {
    return Option.some(Spot.point(item, originalOffset));
  } else {
    return Gather.seekRight(universe, item, universe.property().isText, isRoot).bind(function (next) {
      return scanRight(universe, next, originalOffset - text.length);
    });
  }
};

export const TextSearch = {
  previousChar,
  nextChar,
  repeatLeft,
  repeatRight,
  expandLeft,
  expandRight,
  scanRight
};