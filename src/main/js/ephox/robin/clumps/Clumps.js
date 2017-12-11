import { Adt } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import { Spot } from '@ephox/phoenix';
import { Descent } from '@ephox/phoenix';
import { Gather } from '@ephox/phoenix';
import Structure from '../api/general/Structure';

var adt = Adt.generate([
  { none: [ 'last', 'mode' ] },
  { running: [ 'next', 'mode' ] },
  { split: [ 'boundary', 'last', 'mode' ] },
  { finished: [ 'element', 'mode' ] }
]);

var clump = Struct.immutable('start', 'soffset', 'finish', 'foffset');

var descendBlock = function (universe, isRoot, block) {
  var leaf = Descent.toLeaf(universe, block, 0);
  if (! skip(universe, leaf.element())) return leaf;
  else return skipToRight(universe, isRoot, leaf.element()).map(function (next) {
    return Spot.point(next, 0);
  }).getOr(leaf);
};

var isBlock = function (universe, item) {
  return Structure.isFrame(universe, item) || Structure.isBlock(universe, item) || Arr.contains([ 'li' ], universe.property().name(item));
};

var skipToRight = function (universe, isRoot, item) {
  return Gather.seekRight(universe, item, function (i) {
    return !skip(universe, i) && !isBlock(universe, i);
  }, isRoot);
};

var skip = function (universe, item) {
  if (! universe.property().isText(item)) return false;
  return universe.property().parent(item).exists(function (p) {
    // Text nodes of these children should be ignored when adding tags.
    // Dupe from phoenix OrphanText. We'll need a better solution for this.
    return Arr.contains([ 'table', 'tbody', 'thead', 'tfoot', 'tr', 'ul', 'ol' ], universe.property().name(p));
  });
};

var walk = function (universe, isRoot, mode, element, target) {
  var next = Gather.walk(universe, element, mode, Gather.walkers().right());
  return next.fold(function () {
    return adt.none(element, Gather.sidestep);
  }, function (n) {
    if (universe.eq(n.item(), target)) return adt.finished(target, n.mode());
    else if (isBlock(universe, n.item())) return adt.split(n.item(), element, n.mode());
    else return adt.running(n.item(), n.mode());
  });
};

/*
 * Resuming is used to find a new starting point for the next clump. It will aim
 * to hit the target or a leaf. Note, resuming should not start again from the same
 * boundary that the previous clump finished within.
 */
var resume = function (universe, isRoot, boundary, target) {
  // I have to sidestep here so I don't descend down the same boundary.
  var next = skipToRight(universe, isRoot, boundary);
  return next.fold(function () {
    return Option.none();
  }, function (n) {
    if (universe.eq(n, target)) return Option.some(target);
    else if (isParent(universe, boundary, n)) return resume(universe, isRoot, n, target);
    else if (isBlock(universe, n)) {
      var leaf = descendBlock(universe, isRoot, n);
      return Option.some(leaf.element());
    }
    return Option.some(n);
  });
};

var isParent = function (universe, child, parent) {
  return universe.property().parent(child).exists(function (p) {
    return universe.eq(p, parent);
  });
};

var scan = function (universe, isRoot, mode, beginning, element, target) {
  // Keep walking the tree.
  var step = walk(universe, isRoot, mode, element, target);
  return step.fold(function (last, _mode) {
    // Hit the last element in the tree, so just stop.
    return [{ start: beginning, finish: last }];
  }, function (next, mode) {
    // Keep going. We haven't finished this clump yet.
    return scan(universe, isRoot, mode, beginning, next, target);
  }, function (boundary, last, _mode) {
    var current = { start: beginning, finish: last };
    // Logic .. if this boundary was a parent, then sidestep.
    var resumption = isParent(universe, element, boundary) ? resume(universe, isRoot, boundary, target) : (function () {
      var leaf = descendBlock(universe, isRoot, boundary);
      return !universe.eq(leaf.element(), boundary) ? Option.some(leaf.element()) : Gather.walk(universe, boundary, Gather.advance, Gather.walkers().right()).map(function (g) { return g.item(); });
    })();

    // We have hit a boundary, so stop the current clump, and start a new from the next starting point.
    return resumption.fold(function () {
      // There was no new starting point, so just return the newly created clump
      return [ current ];

    }, function (n) {
      if (universe.eq(n, target)) return [ current ].concat({ start: target, finish: target });
      // There was a new starting point, so scan for more clumps and accumulate the result.
      return [ current ].concat(scan(universe, isRoot, Gather.advance, n, n, target));
    });
  }, function (elem, _mode) {
    // We hit the final destination, so finish our current clump
    return [{ start: beginning, finish: elem }];
  });
};

var getEnd = function (universe, item) {
  return universe.property().isText(item) ? universe.property().getText(item).length : universe.property().children(item).length;
};

var drop = function (universe, item, offset) {
  if (isBlock(universe, item)) {
    var children = universe.property().children(item);
    if (offset >= 0 && offset < children.length) return drop(universe, children[offset], 0);
    else if (offset === children.length) return drop(universe, children[children.length - 1], 0);
    else return item;
  } else {
    return item;
  }
};

var skipInBlock = function (universe, isRoot, item, offset) {
  var dropped = drop(universe, item, offset);
  if (! skip(universe, dropped)) return dropped;
  return skipToRight(universe, isRoot, dropped).getOr(dropped);
};

var doCollect = function (universe, isRoot, start, soffset, finish, foffset) {
  // We can't wrap block elements, so descend if we start on a block.
  var droppedStart = skipInBlock(universe, isRoot, start, soffset);
  var droppedFinish = skipInBlock(universe, isRoot, finish, foffset);

  // If the dropped start should be skipped, find the thing to the right of it.
  var raw = scan(universe, isRoot, Gather.sidestep, droppedStart, droppedStart, droppedFinish);
  return Arr.map(raw, function (r, i) {
    // Incorporate any offsets that were required.
    var soff = universe.eq(r.start, start) ? soffset : 0;
    var foff = universe.eq(r.finish, finish) ? foffset : getEnd(universe, r.finish);
    return clump(r.start, soff, r.finish, foff);
  });
};

var single = function (universe, isRoot, item, soffset, foffset) {
  // If we aren't on blocks, just span a clump from start to finish.
  if (! isBlock(universe, item)) return [ clump(item, soffset, item, foffset) ];

  // Jump to the leaves and try again if we have changed.
  var start = Descent.toLeaf(universe, item, soffset);
  var finish = Descent.toLeaf(universe, item, foffset);
  var changed = !universe.eq(start.element(), item) || !universe.eq(finish.element(), item);
  return changed ? collect(universe, isRoot, start.element(), start.offset(), finish.element(), finish.offset())
                 : [ clump(start.element(), start.offset(), finish.element(), finish.offset()) ];
};

var collect = function (universe, isRoot, start, soffset, finish, foffset) {
  return universe.eq(start, finish) ?
    single(universe, isRoot, start, soffset, foffset) :
    doCollect(universe, isRoot, start, soffset, finish, foffset);
};

export default <any> {
  collect: collect
};