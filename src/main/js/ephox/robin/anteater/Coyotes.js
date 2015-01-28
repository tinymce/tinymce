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
      console.log('current: ', element.dom());
      var next = Gather.seekRight(universe, element, Fun.constant(true), isRoot);
      return next.fold(function () {
        return adt.none(element);
      }, function (n) {
        console.log('next: ', n.dom());
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
        console.log('leaf: ', leaf.element().dom());
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
        return [{ start: beginning, end: last }];
      }, function (next) {
        // Keep going.
        return yeti(universe, isRoot, beginning, next, target);
      }, function (boundary, last) {
        var current = { start: beginning, end: last };
        return getNextStartingPoint(universe, isRoot, boundary, target).fold(function () {
          return [ current, { start: target, end: target } ];
        }, function (n) {
          return [ current ].concat(yeti(universe, isRoot, n, n, target));
        });
      }, function (element) {
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