define(
  'ephox.robin.anteater.Coyotes',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.api.general.Structure',
    'ephox.scullion.ADT'
  ],

  function (Fun, Option, Gather, Structure, ADT) {
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
        if (universe.eq(n.item(), target)) return adt.finished(target);
        else if (Structure.isBlock(universe, n.item())) return adt.split(n.item(), element);
        else return adt.running(n.item());
      });
    };

    var getNextStartingPoint = function (universe, isRoot, current, target) {
      return doWile(universe, isRoot, current, target).fold(function (last) {
        return Option.none();
      }, function (next) {
        return Option.some(next);
      }, function (boundary, last) {
        return getNextStartingPoint(universe, isRoot, boundary, target);
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
        return getNextStartingPoint(universe, isRoot, boundary).fold(function () {
          return [ current, { start: target, end: target } ];
        }, function (n) {
          return [ current ].concat(yeti(universe, isRoot, n, n, target));
        });
      }, function (element) {
        return [{ start: beginning: end: element }]
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