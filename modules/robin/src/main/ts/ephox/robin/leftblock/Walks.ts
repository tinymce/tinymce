import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import { Gather, Transition, Traverse } from '@ephox/phoenix';

export interface Walks {
  rules?: {
    current: Transition;
    next: Transition;
    fallback: Option<Transition>;
  }[];
  inclusion: <E, D> (universe: Universe<E, D>, next: Traverse<E>, item: E) => boolean;
}

const top: Walks = {
  // The top strategy ignores children.
  rules: [
    { current: Gather.backtrack, next: Gather.sidestep, fallback: Option.none<Transition>() },
    { current: Gather.sidestep, next: Gather.sidestep, fallback: Option.some(Gather.backtrack) },
    { current: Gather.advance, next: Gather.sidestep, fallback: Option.some(Gather.sidestep) }
  ],
  inclusion: <E, D> (universe: Universe<E, D>, next: Traverse<E>, item: E) => {
    // You can't just check the mode, because it may have fallen back to backtracking,
    // even though mode was sidestep. Therefore, to see if a node is something that was
    // the parent of a previously traversed item, we have to do this. Very hacky... find a
    // better way.
    const isParent = universe.property().parent(item).exists(function (p) {
      return universe.eq(p, next.item());
    });
    return !isParent;
  }
};

const all: Walks = {
  // rules === undefined, so use default.
  rules: undefined,
  inclusion: <E, D> (universe: Universe<E, D>, next: Traverse<E>, _item: E) => universe.property().isText(next.item())
};

export const Walks = {
  top,
  all
};