define(
  'ephox.robin.anteater.Coyotes',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.phoenix.wrap.Navigation',
    'ephox.robin.api.general.Structure',
    'ephox.scullion.ADT'
  ],

  function (Fun, Option, Gather, Navigation, Structure, ADT) {
    var adt = ADT.generate([
      { none: [ 'last', 'mode' ] },
      { running: [ 'next', 'mode' ] },
      { split: [ 'boundary', 'last', 'mode' ] },
      { finished: [ 'element', 'mode' ] },
    ]);

    var doWile = function (universe, isRoot, mode, element, target) {
      var next = Gather.walk(universe, element, mode, Gather.walkers().right());
      return next.fold(function () {
        return adt.none(element, Gather.sidestep);
      }, function (n) {
        if (universe.eq(n.item(), target)) return adt.finished(target, n.mode());
        else if (Structure.isBlock(universe, n.item())) return adt.split(n.item(), element, n.mode());
        else return adt.running(n.item(), n.mode());
      });
    };

    //var walk = function (universe, item, mode, direction, _rules) {
    //   return Walker.go(universe, item, mode, direction, _rules);
    // };


    var getNextStartingPoint = function (universe, isRoot, current, target) {
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

    var yeti = function (universe, isRoot, mode, beginning, element, target) {
      var result = doWile(universe, isRoot, mode, element, target);
      return result.fold(function (last, _mode) {
        return [{ start: beginning, end: last }];
      }, function (next, mode) {
        // Keep going.
        return yeti(universe, isRoot, mode, beginning, next, target);
      }, function (boundary, last, _mode) {
        var current = { start: beginning, end: last };
        return getNextStartingPoint(universe, isRoot, boundary, target).fold(function () {
          return [ current ];
        }, function (n) {
          return [ current ].concat(yeti(universe, isRoot, Gather.sidestep, n, n, target));
        });
      }, function (element, _mode) {
        return [{ start: beginning, end: element }];
      });
    };

    var wile = function (universe, isRoot, start, soffset, finish, foffset) {
      // I need to store a list of coyotes; Will use fold later (probably).
      return yeti(universe, isRoot, Gather.sidestep, start, start, finish);
    };

    return {
      wile: wile
    };
  }
);