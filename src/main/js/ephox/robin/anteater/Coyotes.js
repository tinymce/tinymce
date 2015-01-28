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
      { none: [ 'last' ] },
      { running: [ 'next' ] },
      { split: [ 'boundary', 'last' ] },
      { finished: [ 'element' ] },
    ]);

    var doWile = function (universe, isRoot, element, target) {
      var next = Gather.seekRight(universe, element, Fun.constant(true), isRoot);
      return next.fold(function () {
        return adt.none(element);
      }, function (n) {
        if (universe.eq(n, target)) return adt.finished(target);
        else if (Structure.isBlock(universe, n)) return adt.split(n, element);
        else return adt.running(n);
      });
    };

    var getNextStartingPoint = function (universe, isRoot, current, target) {
      return doWile(universe, isRoot, current, target).fold(function (last) {
        return Option.none();
      }, function (next) {
        return Option.some(next);
      }, function (boundary, last) {
        // Jump to the leaf. This will only work if the current isn't inside the boundary.

        // I can do this because I am sidestepping from the previous boundary on the first
        // line of this function.
        var leaf = Navigation.toLeaf(universe, boundary, 0);
        return Option.some(leaf.element());
        // return getNextStartingPoint(universe, isRoot, boundary, target);
      }, function (target) {
        // should I just include target for this?
        return Option.none();
      });
    };

    var yeti = function (universe, isRoot, beginning, element, target) {
      var result = doWile(universe, isRoot, element, target);
      return result.fold(function (last) {
        console.log('NONE => ', beginning.dom(), last.dom());
        return [{ start: beginning, end: last }];
      }, function (next) {
        // Keep going.
        return yeti(universe, isRoot, beginning, next, target);
      }, function (boundary, last) {
        var current = { start: beginning, end: last };
        return getNextStartingPoint(universe, isRoot, boundary, target).fold(function () {
          console.log('NO RESTARTING POINT => ', current.start.dom(), current.end.dom(), target.dom());
          return [ current ];
        }, function (n) {
          console.log('RESTARTING POINT => ', current.start.dom(), current.end.dom());
          return [ current ].concat(yeti(universe, isRoot, n, n, target));
        });
      }, function (element) {
        console.log('DONE => ', beginning.dom(), end.dom());
        return [{ start: beginning, end: element }];
      });
    };

    var wile = function (universe, isRoot, start, soffset, finish, foffset) {
      // I need to store a list of coyotes; Will use fold later (probably).
      return yeti(universe, isRoot, start, start, finish);
    };

    return {
      wile: wile
    };
  }
);