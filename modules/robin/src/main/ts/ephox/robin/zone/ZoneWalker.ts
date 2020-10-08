import { Universe } from '@ephox/boss';
import { Fun, Optional } from '@ephox/katamari';
import { Gather, Traverse } from '@ephox/phoenix';
import { ZonePosition } from '../api/general/ZonePosition';
import { ZoneViewports } from '../api/general/ZoneViewports';
import { WordDecisionItem } from '../words/WordDecision';
import { LanguageZones, ZoneDetails } from './LanguageZones';

const process = <E, D> (
  universe: Universe<E, D>,
  stack: LanguageZones<E>,
  transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>,
  viewport: ZoneViewports<E>,
  traverse: Traverse<E>
): Optional<Traverse<E>> => {
  // Find if the current item has a lang property on it.
  const currentLang = universe.property().isElement(traverse.item) ?
    Optional.from(universe.attrs().get(traverse.item, 'lang')) :
    Optional.none<string>();

  if (universe.property().isText(traverse.item)) {
    stack.addDetail(transform(universe, traverse.item));
    return Optional.some(traverse);
  } else if (universe.property().isBoundary(traverse.item)) {
    const position = viewport.assess(traverse.item);
    return ZonePosition.cata(position,
      (_aboveBlock) => {
        // We are above the viewport, so skip
        // Only sidestep if we haven't already tried it. Otherwise, we'll loop forever.
        if (traverse.mode !== Gather.backtrack) {
          return Optional.some({ item: traverse.item, mode: Gather.sidestep });
        } else {
          return Optional.none();
        }
      },
      (_inBlock) => {
        // We are in the viewport, so process normally
        const opening = traverse.mode === Gather.advance;
        (opening ? stack.openBoundary : stack.closeBoundary)(currentLang, traverse.item);
        return Optional.some(traverse);
      },
      (_belowBlock) => Optional.none() // We've gone past the end of the viewport, so stop completely
    );
  } else if (universe.property().isEmptyTag(traverse.item)) {
    stack.addEmpty(traverse.item);
    return Optional.some(traverse);
  } else {
    const opening = traverse.mode === Gather.advance;
    (opening ? stack.openInline : stack.closeInline)(currentLang, traverse.item);
    return Optional.some(traverse);
  }
};

const walk = <E, D> (
  universe: Universe<E, D>,
  start: E,
  finish: E,
  defaultLang: string,
  transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>,
  viewport: ZoneViewports<E>
): ZoneDetails<E>[] => {
  const shouldContinue = (traverse: Traverse<E>) => {
    if (!universe.eq(traverse.item, finish)) {
      return true;
    }

    return (
      traverse.mode === Gather.advance &&
      !universe.property().isText(traverse.item) &&
      universe.property().children(traverse.item).length !== 0
    );
  };

  // INVESTIGATE: Make the language zone stack immutable *and* performant
  const stack = LanguageZones.nu<E>(defaultLang);
  let state = Optional.some<Traverse<E>>({ item: start, mode: Gather.advance })
    .filter(shouldContinue);

  while (state.isSome()) {
    state = state
      .bind(Fun.curry(process, universe, stack, transform, viewport))
      .bind((traverse) => Gather.walk(universe, traverse.item, traverse.mode, Gather.walkers().right()))
      .filter(shouldContinue);
  }

  if (universe.property().isText(finish)) {
    stack.addDetail(transform(universe, finish));
  }

  return stack.done();
};

export {
  walk
};
