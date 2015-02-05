define(
  'ephox.robin.clumps.Clumps',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.phoenix.wrap.Navigation',
    'ephox.robin.api.general.Structure',
    'ephox.scullion.ADT',
    'ephox.scullion.Struct'
  ],

  function (Arr, Fun, Option, Gather, Navigation, Structure, Adt, Struct) {
    var adt = Adt.generate([
      { none: [ 'last', 'mode' ] },
      { running: [ 'next', 'mode' ] },
      { split: [ 'boundary', 'last', 'mode' ] },
      { finished: [ 'element', 'mode' ] }
    ]);

    var clump = Struct.immutable('start', 'soffset', 'finish', 'foffset');

    var walk = function (universe, isRoot, mode, element, target) {
      var next = Gather.walk(universe, element, mode, Gather.walkers().right());
      return next.fold(function () {
        return adt.none(element, Gather.sidestep);
      }, function (n) {
        if (universe.eq(n.item(), target)) return adt.finished(target, n.mode());
        else if (Structure.isBlock(universe, n.item()) || isOtherBlock(universe, n.item())) return adt.split(n.item(), element, n.mode());
        else return adt.running(n.item(), n.mode());
      });
    };

    var isOtherBlock = function (universe, element) {
      return Arr.contains([ 'li' ], universe.property().name(element));
    };

    /*
     * Resuming is used to find a new starting point for the next clump. It will aim
     * to hit the target or a leaf. Note, resuming should not start again from the same
     * boundary that the previous clump finished within.
     */
    var resume = function (universe, isRoot, boundary, target) {
      // I have to sidestep here so I don't descend down the same boundary.
      var next = Gather.seekRight(universe, boundary, Fun.constant(true), isRoot);
      return next.fold(function () {
        return Option.none();
      }, function (n) {
        if (universe.eq(n, target)) return Option.some(target);
        else if (isParent(universe, boundary, n)) return resume(universe, isRoot, n, target);
        else if (Structure.isBlock(universe, n) || isOtherBlock(universe, n)) {
          var leaf = Navigation.toLeaf(universe, n, 0);
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
          var leaf = Navigation.toLeaf(universe, boundary, 0);
          return !universe.eq(leaf.element(), boundary) ? Option.some(leaf.element()) : Gather.walk(universe, boundary, Gather.advance, Gather.walkers().right()).map(function (g) { return g.item(); });
        })();

        // We have hit a boundary, so stop the current clump, and start a new from the next starting point.
        return resumption.fold(function () {
          // There was no new starting point, so just return the newly created clump
          return [ current ];

        }, function (n) {
          if (universe.eq(n, target)) return [ current ].concat({ start: target, finish: target });
          // There was a new starting point, so scan for more clumps and accumulate the result.
          return [ current ].concat(scan(universe, isRoot, Gather.sidestep, n, n, target));
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
      if (Structure.isBlock(universe, item)) {
        var children = universe.property().children(item);
        if (offset >= 0 && offset < children.length) return drop(universe, children[offset], 0);
        else if (offset === children.length) return drop(universe, children[children.length - 1], 0);
        else return item;
      } else {
        return item;
      }
    };

    var doCollect = function (universe, isRoot, start, soffset, finish, foffset) {
      // We can't wrap block elements, so descend if we start on a block.
      var droppedStart = drop(universe, start, soffset);
      var droppedFinish = drop(universe, finish, foffset);
      var raw = scan(universe, isRoot, Gather.sidestep, droppedStart, droppedStart, droppedFinish);
      return Arr.map(raw, function (r, i) {
        // Incorporate any offsets that were required.
        var soff = universe.eq(r.start, start) ? soffset : 0;
        var foff = universe.eq(r.finish, finish) ? foffset : getEnd(universe, r.finish);
        return clump(r.start, soff, r.finish, foff);
      });
    };

    var collect = function (universe, isRoot, start, soffset, finish, foffset) {
      return universe.eq(start, finish) ?
        [ clump(start, soffset, finish, foffset) ] : 
        doCollect(universe, isRoot, start, soffset, finish, foffset);
    };

    return {
      collect: collect
    };
  }
);