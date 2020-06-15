import { Universe } from '@ephox/boss';
import { Adt, Option } from '@ephox/katamari';
import { Gather, Transition } from '@ephox/phoenix';
import { ZonePosition } from '../api/general/ZonePosition';
import { ZoneViewports } from '../api/general/ZoneViewports';
import { Trampoline, TrampolineFn } from '../util/Trampoline';
import { WordDecisionItem } from '../words/WordDecision';
import { LanguageZones, ZoneDetails } from './LanguageZones';

interface ZoneWalkerState<E> {
  fold: <T> (
    inline: (item: E, mode: Transition, lang: Option<string>) => T,
    text: (item: E, mode: Transition) => T,
    empty: (item: E, mode: Transition) => T,
    boundary: (item: E, mode: Transition, lang: Option<string>) => T,
    concluded: (item: E, mode: Transition) => T
  ) => T;
  match: <T> (branches: {
    inline: (item: E, mode: Transition, lang: Option<string>) => T;
    text: (item: E, mode: Transition) => T;
    empty: (item: E, mode: Transition) => T;
    boundary: (item: E, mode: Transition, lang: Option<string>) => T;
    concluded: (item: E, mode: Transition) => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  inline: <E> (item: E, mode: Transition, lang: Option<string>) => ZoneWalkerState<E>;
  text: <E> (item: E, mode: Transition) => ZoneWalkerState<E>;
  empty: <E> (item: E, mode: Transition) => ZoneWalkerState<E>;
  boundary: <E> (item: E, mode: Transition, lang: Option<string>) => ZoneWalkerState<E>;
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
    Option.from(universe.attrs().get(item, 'lang')) :
    Option.none<string>();

  if (universe.property().isText(item)) {
    return adt.text(item, mode);
  } else if (stopOn(item, mode)) {
    return adt.concluded(item, mode);
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
    (n) => analyse(universe, n.item(), n.mode(), stopOn)
  );

const process = <E, D> (
  universe: Universe<E, D>,
  outcome: ZoneWalkerState<E>,
  stopOn: (item: E, mode: Transition) => boolean,
  stack: LanguageZones<E>,
  transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>,
  viewport: ZoneViewports<E>
): TrampolineFn => () => outcome.fold(
  (aItem, aMode, aLang) => {
    // inline(aItem, aMode, aLang)
    const opening = aMode === Gather.advance;
    (opening ? stack.openInline : stack.closeInline)(aLang, aItem);
    return doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);
  },
  (aItem, aMode) => {
    const detail = transform(universe, aItem);
    // text (aItem, aMode)
    stack.addDetail(detail);
    return (!stopOn(aItem, aMode)) ?
      doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport) :
      Trampoline.stop();
  },
  (aItem, aMode) => {
    // empty (aItem, aMode)
    stack.addEmpty(aItem);
    return doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);
  },
  (aItem, aMode, aLang) => {
    // Use boundary positions to assess whether we have moved out of the viewport.
    const position = viewport.assess(aItem);
    return ZonePosition.cata(position,
      (_aboveBlock) => {
        // We are before the viewport, so skip
        // Only sidestep if we hadn't already tried it. Otherwise, we'll loop forever.
        if (aMode !== Gather.backtrack) {
          return doWalk(universe, aItem, Gather.sidestep, stopOn, stack, transform, viewport);
        } else {
          return Trampoline.stop();
        }
      },
      (_inBlock) => {
        // We are in the viewport, so process normally
        const opening = aMode === Gather.advance;
        (opening ? stack.openBoundary : stack.closeBoundary)(aLang, aItem);
        return doWalk(universe, aItem, aMode, stopOn, stack, transform, viewport);
      },
      (_belowBlock) => Trampoline.stop() // We've gone past the end of the viewport, so stop completely
    );
  },
  (_aItem, _aMode) => Trampoline.stop() // concluded(aItem, aMode) DO NOTHING
);

// I'm going to trampoline this:
// http://stackoverflow.com/questions/25228871/how-to-understand-trampoline-in-javascript
// The reason is because we often hit stack problems with this code, so this is an attempt to resolve them.
// The key thing is that you need to keep returning a function.
const doWalk = <E, D> (
  universe: Universe<E, D>,
  current: E,
  mode: Transition,
  stopOn: (item: E, mode: Transition) => boolean,
  stack: LanguageZones<E>,
  transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>,
  viewport: ZoneViewports<E>
): TrampolineFn => {
  const outcome = takeStep(universe, current, mode, stopOn);
  return process(universe, outcome, stopOn, stack, transform, viewport);
};

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
  const initial = analyse(universe, start, mode, stopOn);

  Trampoline.run(process(universe, initial, stopOn, stack, transform, viewport));

  return stack.done();
};

export {
  walk
};
