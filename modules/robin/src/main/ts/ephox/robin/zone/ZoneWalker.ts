import { Universe } from '@ephox/boss';
import { Adt, Optional } from '@ephox/katamari';
import { Gather, Transition } from '@ephox/phoenix';
import { ZonePosition } from '../api/general/ZonePosition';
import { ZoneViewports } from '../api/general/ZoneViewports';
import { WordDecisionItem } from '../words/WordDecision';
import { LanguageZones, ZoneDetails } from './LanguageZones';

interface ZoneWalkerState<E> {
  fold: <T> (
    inline: (item: E, mode: Transition, lang: Optional<string>) => T,
    text: (item: E, mode: Transition) => T,
    empty: (item: E, mode: Transition) => T,
    boundary: (item: E, mode: Transition, lang: Optional<string>) => T,
    concluded: (item: E, mode: Transition) => T
  ) => T;
  match: <T> (branches: {
    inline: (item: E, mode: Transition, lang: Optional<string>) => T;
    text: (item: E, mode: Transition) => T;
    empty: (item: E, mode: Transition) => T;
    boundary: (item: E, mode: Transition, lang: Optional<string>) => T;
    concluded: (item: E, mode: Transition) => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  inline: <E> (item: E, mode: Transition, lang: Optional<string>) => ZoneWalkerState<E>;
  text: <E> (item: E, mode: Transition) => ZoneWalkerState<E>;
  empty: <E> (item: E, mode: Transition) => ZoneWalkerState<E>;
  boundary: <E> (item: E, mode: Transition, lang: Optional<string>) => ZoneWalkerState<E>;
  concluded: <E> (item: E, mode: Transition) => ZoneWalkerState<E>;
} = Adt.generate([
  // an inline element, so use the lang to identify if a new zone is needed
  { inline: [ 'item', 'mode', 'lang' ] },
  { text: [ 'item', 'mode' ] },
  // things like <img>, <br>
  { empty: [ 'item', 'mode' ] },
  // things like boundary tags
  { boundary: [ 'item', 'mode', 'lang' ] },
  // hit the starting tag
  { concluded: [ 'item', 'mode' ] }
]);

const analyse = <E, D> (
  universe: Universe<E, D>,
  item: E,
  mode: Transition,
  stopOn: (item: E, mode: Transition) => boolean
): ZoneWalkerState<E> => {
  // Find if the current item has a lang property on it.
  const currentLang = universe.property().isElement(item) ?
    Optional.from(universe.attrs().get(item, 'lang')) :
    Optional.none<string>();

  if (stopOn(item, mode)) {
    return adt.concluded(item, mode);
  } else if (universe.property().isText(item)) {
    return adt.text(item, mode);
  } else if (universe.property().isBoundary(item)) {
    return adt.boundary(item, mode, currentLang);
  } else if (universe.property().isEmptyTag(item)) {
    return adt.empty(item, mode);
  } else {
    return adt.inline(item, mode, currentLang);
  }
};

const takeStep = <E, D> (
  universe: Universe<E, D>,
  item: E,
  mode: Transition,
  stopOn: (item: E, mode: Transition) => boolean
): ZoneWalkerState<E> =>
  Gather.walk(universe, item, mode, Gather.walkers().right()).fold(
    () => adt.concluded(item, mode),
    (n) => analyse(universe, n.item, n.mode, stopOn)
  );

const process = <E, D> (
  universe: Universe<E, D>,
  outcome: ZoneWalkerState<E>,
  stopOn: (item: E, mode: Transition) => boolean,
  stack: LanguageZones<E>,
  transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>,
  viewport: ZoneViewports<E>
): Optional<ZoneWalkerState<E>> => outcome.fold(
  (aItem, aMode, aLang) => {
    // inline(aItem, aMode, aLang)
    const opening = aMode === Gather.advance;
    (opening ? stack.openInline : stack.closeInline)(aLang, aItem);
    return Optional.some(takeStep(universe, aItem, aMode, stopOn));
  },
  (aItem, aMode) => {
    const detail = transform(universe, aItem);
    // text (aItem, aMode)
    stack.addDetail(detail);
    return Optional.some(takeStep(universe, aItem, aMode, stopOn));
  },
  (aItem, aMode) => {
    // empty (aItem, aMode)
    stack.addEmpty(aItem);
    return Optional.some(takeStep(universe, aItem, aMode, stopOn));
  },
  (aItem, aMode, aLang) => {
    // Use boundary positions to assess whether we have moved out of the viewport.
    const position = viewport.assess(aItem);
    return ZonePosition.cata(position,
      (_aboveBlock) => {
        // We are before the viewport, so skip
        // Only sidestep if we hadn't already tried it. Otherwise, we'll loop forever.
        if (aMode !== Gather.backtrack) {
          return Optional.some(takeStep(universe, aItem, Gather.sidestep, stopOn));
        } else {
          return Optional.none();
        }
      },
      (_inBlock) => {
        // We are in the viewport, so process normally
        const opening = aMode === Gather.advance;
        (opening ? stack.openBoundary : stack.closeBoundary)(aLang, aItem);
        return Optional.some(takeStep(universe, aItem, aMode, stopOn));
      },
      (_belowBlock) => Optional.none() // We've gone past the end of the viewport, so stop completely
    );
  },
  (_aItem, _aMode) => Optional.none() // concluded(aItem, aMode) DO NOTHING
);

const walk = <E, D> (
  universe: Universe<E, D>,
  start: E,
  finish: E,
  defaultLang: string,
  transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>,
  viewport: ZoneViewports<E>
): ZoneDetails<E>[] => {
  const stopOn = (sItem: E, sMode: Transition) =>
    universe.eq(sItem, finish) && (
      sMode !== Gather.advance ||
      universe.property().isText(sItem) ||
      universe.property().children(sItem).length === 0
    );

  // INVESTIGATE: Make the language zone stack immutable *and* performant
  const stack = LanguageZones.nu<E>(defaultLang);
  const mode = Gather.advance;
  let state = Optional.some(analyse(universe, start, mode, stopOn));

  while (state.isSome()) {
    state = state.bind((state) => process(universe, state, stopOn, stack, transform, viewport));
  }

  if (universe.property().isText(finish)) {
    stack.addDetail(transform(universe, finish));
  }

  return stack.done();
};

export {
  walk
};
