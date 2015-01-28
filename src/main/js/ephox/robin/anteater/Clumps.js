define(
  'ephox.robin.anteater.Clumps',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.phoenix.wrap.Navigation',
    'ephox.robin.api.general.Structure',
    'ephox.scullion.ADT'
  ],

  function (Arr, Fun, Option, Gather, Navigation, Structure, Adt) {
    var adt = Adt.generate([
      { none: [ 'last', 'mode' ] },
      { running: [ 'next', 'mode' ] },
      { split: [ 'boundary', 'last', 'mode' ] },
      { finished: [ 'element', 'mode' ] }
    ]);

    var walk = function (universe, isRoot, mode, element, target) {
      var next = Gather.walk(universe, element, mode, Gather.walkers().right());
      return next.fold(function () {
        return adt.none(element, Gather.sidestep);
      }, function (n) {
        if (universe.eq(n.item(), target)) return adt.finished(target, n.mode());
        else if (Structure.isBlock(universe, n.item())) return adt.split(n.item(), element, n.mode());
        else return adt.running(n.item(), n.mode());
      });
    };

    var resume = function (universe, isRoot, current, target) {
      // I have to sidestep here so I don't descend down the same boundary.
      var next = Gather.seekRight(universe, current, Fun.constant(true), isRoot);
      return next.fold(function () {
        return Option.none();
      }, function (n) {
        if (universe.eq(n, target)) return Option.none();
        else if (Structure.isBlock(universe, n)) {
          var leaf = Navigation.toLeaf(universe, n, 0);
          return Option.some(leaf.element());
        } 
        else return Option.none();
      });
    };

    var scan = function (universe, isRoot, mode, beginning, element, target) {
      var step = walk(universe, isRoot, mode, element, target);
      return step.fold(function (last, _mode) {
        return [{ start: beginning, end: last }];
      }, function (next, mode) {
        // Keep going.
        return scan(universe, isRoot, mode, beginning, next, target);
      }, function (boundary, last, _mode) {
        var current = { start: beginning, end: last };
        return resume(universe, isRoot, boundary, target).fold(function () {
          return [ current ];
        }, function (n) {
          return [ current ].concat(scan(universe, isRoot, Gather.sidestep, n, n, target));
        });
      }, function (element, _mode) {
        return [{ start: beginning, end: element }];
      });
    };

    var getEnd = function (universe, item) {
      return universe.property().isText(item) ? universe.property().getText(item).length : universe.property().children(item).length;
    };

    var pluck = function (universe, isRoot, start, soffset, finish, foffset) {
      var raw = scan(universe, isRoot, Gather.sidestep, start, start, finish);
      return Arr.map(raw, function (r, i) {
        var soff = universe.eq(r.start, start) ? soffset : 0;
        var eoff = universe.eq(r.end, finish) ? foffset : getEnd(universe, r.end);
        return { start: r.start, soffset: soff, end: r.end, eoffset: eoff };
      });
    };

    var collect = function (universe, isRoot, start, soffset, finish, foffset) {
      return universe.eq(start, finish) ?
        [ { start: start, soffset: soffset, end: finish, eoffset: foffset } ] : 
        pluck(universe, isRoot, start, soffset, finish, foffset);
    };

    return {
      collect: collect
    };
  }
);