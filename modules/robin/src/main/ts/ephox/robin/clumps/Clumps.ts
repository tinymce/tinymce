import { Universe } from '@ephox/boss';
import { Adt, Arr, Option } from '@ephox/katamari';
import { Descent, Gather, Spot, Transition } from '@ephox/phoenix';
import * as Structure from '../api/general/Structure';

export interface Clump<E> {
  start: E;
  soffset: number;
  finish: E;
  foffset: number;
}

interface ClumpsScan<E> {
  fold: <T> (
    none: (last: E, mode: Transition) => T,
    running: (next: E, mode: Transition) => T,
    split: (boundary: E, last: E, mode: Transition) => T,
    finished: (element: E, mode: Transition) => T
  ) => T;
  match: <T> (branches: {
    none: (last: E, mode: Transition) => T;
    running: (next: E, mode: Transition) => T;
    split: (boundary: E, last: E, mode: Transition) => T;
    finished: (element: E, mode: Transition) => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  none: <E> (last: E, mode: Transition) => ClumpsScan<E>;
  running: <E> (next: E, mode: Transition) => ClumpsScan<E>;
  split: <E> (boundary: E, last: E, mode: Transition) => ClumpsScan<E>;
  finished: <E> (element: E, mode: Transition) => ClumpsScan<E>;
} = Adt.generate([
  { none: [ 'last', 'mode' ] },
  { running: [ 'next', 'mode' ] },
  { split: [ 'boundary', 'last', 'mode' ] },
  { finished: [ 'element', 'mode' ] }
]);

interface ClumpRange<E> {
  start: E;
  finish: E;
}

const clump = <E> (start: E, soffset: number, finish: E, foffset: number): Clump<E> => ({
  start,
  soffset,
  finish,
  foffset
});

const descendBlock = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, block: E) {
  const leaf = Descent.toLeaf(universe, block, 0);
  if (!skip(universe, leaf.element())) {
    return leaf;
  } else {
    return skipToRight(universe, isRoot, leaf.element()).map(function (next) {
      return Spot.point(next, 0);
    }).getOr(leaf);
  }
};

const isBlock = function <E, D> (universe: Universe<E, D>, item: E) {
  return Structure.isFrame(universe, item) || Structure.isBlock(universe, item) || Arr.contains([ 'li' ], universe.property().name(item));
};

const skipToRight = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, item: E) {
  return Gather.seekRight(universe, item, function (i) {
    return !skip(universe, i) && !isBlock(universe, i);
  }, isRoot);
};

const skip = function <E, D> (universe: Universe<E, D>, item: E) {
  if (!universe.property().isText(item)) {
    return false;
  }
  return universe.property().parent(item).exists(function (p) {
    // Text nodes of these children should be ignored when adding tags.
    // Dupe from phoenix OrphanText. We'll need a better solution for this.
    return Arr.contains([ 'table', 'tbody', 'thead', 'tfoot', 'tr', 'ul', 'ol' ], universe.property().name(p));
  });
};

const walk = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, mode: Transition, element: E, target: E) {
  const next = Gather.walk(universe, element, mode, Gather.walkers().right());
  return next.fold(function () {
    return adt.none(element, Gather.sidestep);
  }, function (n) {
    if (universe.eq(n.item(), target)) {
      return adt.finished(target, n.mode());
    } else if (isBlock(universe, n.item())) {
      return adt.split(n.item(), element, n.mode());
    } else {
      return adt.running(n.item(), n.mode());
    }
  });
};

/*
 * Resuming is used to find a new starting point for the next clump. It will aim
 * to hit the target or a leaf. Note, resuming should not start again from the same
 * boundary that the previous clump finished within.
 */
const resume = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, boundary: E, target: E): Option<E> {
  // I have to sidestep here so I don't descend down the same boundary.
  const next = skipToRight(universe, isRoot, boundary);
  return next.fold(function () {
    return Option.none<E>();
  }, function (n) {
    if (universe.eq(n, target)) {
      return Option.some(target);
    } else if (isParent(universe, boundary, n)) {
      return resume(universe, isRoot, n, target);
    } else if (isBlock(universe, n)) {
      const leaf = descendBlock(universe, isRoot, n);
      return Option.some(leaf.element());
    }
    return Option.some(n);
  });
};

const isParent = function <E, D> (universe: Universe<E, D>, child: E, parent: E) {
  return universe.property().parent(child).exists(function (p) {
    return universe.eq(p, parent);
  });
};

const scan = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, mode: Transition, beginning: E, element: E, target: E): ClumpRange<E>[] {
  // Keep walking the tree.
  const step = walk(universe, isRoot, mode, element, target);
  return step.fold(function (last, _mode) {
    // Hit the last element in the tree, so just stop.
    return [{ start: beginning, finish: last }];
  }, function (next, mode) {
    // Keep going. We haven't finished this clump yet.
    return scan(universe, isRoot, mode, beginning, next, target);
  }, function (boundary, last, _mode) {
    const current = { start: beginning, finish: last };
    // Logic .. if this boundary was a parent, then sidestep.
    const resumption = isParent(universe, element, boundary) ? resume(universe, isRoot, boundary, target) : (function () {
      const leaf = descendBlock(universe, isRoot, boundary);
      return !universe.eq(leaf.element(), boundary) ? Option.some(leaf.element()) : Gather.walk(universe, boundary, Gather.advance, Gather.walkers().right()).map(function (g) { return g.item(); });
    })();

    // We have hit a boundary, so stop the current clump, and start a new from the next starting point.
    return resumption.fold(function () {
      // There was no new starting point, so just return the newly created clump
      return [ current ];

    }, function (n) {
      if (universe.eq(n, target)) {
        return [ current ].concat({ start: target, finish: target });
      }
      // There was a new starting point, so scan for more clumps and accumulate the result.
      return [ current ].concat(scan(universe, isRoot, Gather.advance, n, n, target));
    });
  }, function (elem, _mode) {
    // We hit the final destination, so finish our current clump
    return [{ start: beginning, finish: elem }];
  });
};

const getEnd = function <E, D> (universe: Universe<E, D>, item: E) {
  return universe.property().isText(item) ? universe.property().getText(item).length : universe.property().children(item).length;
};

const drop = function <E, D> (universe: Universe<E, D>, item: E, offset: number): E {
  if (isBlock(universe, item)) {
    const children = universe.property().children(item);
    if (offset >= 0 && offset < children.length) {
      return drop(universe, children[offset], 0);
    } else if (offset === children.length) {
      return drop(universe, children[children.length - 1], 0);
    } else {
      return item;
    }
  } else {
    return item;
  }
};

const skipInBlock = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, item: E, offset: number) {
  const dropped = drop(universe, item, offset);
  if (!skip(universe, dropped)) {
    return dropped;
  }
  return skipToRight(universe, isRoot, dropped).getOr(dropped);
};

const doCollect = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, soffset: number, finish: E, foffset: number) {
  // We can't wrap block elements, so descend if we start on a block.
  const droppedStart = skipInBlock(universe, isRoot, start, soffset);
  const droppedFinish = skipInBlock(universe, isRoot, finish, foffset);

  // If the dropped start should be skipped, find the thing to the right of it.
  const raw = scan(universe, isRoot, Gather.sidestep, droppedStart, droppedStart, droppedFinish);
  return Arr.map(raw, function (r) {
    // Incorporate any offsets that were required.
    const soff = universe.eq(r.start, start) ? soffset : 0;
    const foff = universe.eq(r.finish, finish) ? foffset : getEnd(universe, r.finish);
    return clump(r.start, soff, r.finish, foff);
  });
};

const single = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, item: E, soffset: number, foffset: number): Clump<E>[] {
  // If we aren't on blocks, just span a clump from start to finish.
  if (!isBlock(universe, item)) {
    return [ clump(item, soffset, item, foffset) ];
  }

  // Jump to the leaves and try again if we have changed.
  const start = Descent.toLeaf(universe, item, soffset);
  const finish = Descent.toLeaf(universe, item, foffset);
  const changed = !universe.eq(start.element(), item) || !universe.eq(finish.element(), item);
  return changed ? collect(universe, isRoot, start.element(), start.offset(), finish.element(), finish.offset())
    : [ clump(start.element(), start.offset(), finish.element(), finish.offset()) ];
};

const collect = function <E, D> (universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, soffset: number, finish: E, foffset: number) {
  return universe.eq(start, finish) ?
    single(universe, isRoot, start, soffset, foffset) :
    doCollect(universe, isRoot, start, soffset, finish, foffset);
};

export {
  collect
};
