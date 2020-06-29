import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Gather, Transition } from '@ephox/phoenix';
import { Walks } from '../../leftblock/Walks';

const walkers = Gather.walkers();

const goLeft = function <E, D> (universe: Universe<E, D>, item: E, mode: Transition, strategy: Walks): E[] {
  // Walk the DOM to the left using the appropriate rules.
  const next = Gather.walk(universe, item, mode, walkers.left(), strategy.rules);
  return next.map(function (n) {
    // If we hit a block, then we stop.
    const isBlock = universe.property().isEmptyTag(n.item()) || universe.property().isBoundary(n.item());
    if (isBlock) {
      return [];
    }
    // Only include the current item if the strategy permits it. Top won't add parents.
    const inclusions = strategy.inclusion(universe, n, item) ? [ n.item() ] : [];
    return inclusions.concat(goLeft(universe, n.item(), n.mode(), strategy));
  }).getOr([]);
};

const run = function <E, D> (strategy: Walks, universe: Universe<E, D>, item: E) {
  const lefts = goLeft(universe, item, Gather.sidestep, strategy);
  return Arr.reverse(lefts).concat([ item ]);
};

const top = <E, D> (universe: Universe<E, D>, item: E) => run(Walks.top, universe, item);
const all = <E, D> (universe: Universe<E, D>, item: E) => run(Walks.all, universe, item);

export {
  top,
  all
};
