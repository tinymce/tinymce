define(
  'ephox.robin.textdata.TextSeeker',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Descent',
    'ephox.phoenix.api.general.Gather',
    'ephox.phoenix.gather.Seeker',
    'ephox.robin.api.general.Structure',
    'ephox.scullion.ADT'
  ],

  function (Option, Spot, Descent, Gather, Seeker, Structure, Adt) {
    var walkLeft = Gather.walkers().left();
    var walkRight = Gather.walkers().right();

    var phase = Adt.generate([
      { abort: [  ] },
      { kontinue: [ ] },
      { finish: [ 'info' ] }
    ]);

    var outcome = Adt.generate([
      { aborted: [] },
      { edge: [ 'element' ] },
      { success: [ 'info' ] }
    ]);

    var isBoundary = function (universe, item) {
      return Structure.isBlock(universe, item) || Structure.isEmptyTag(universe, item);
    };

    var repeat = function (universe, item, mode, offsetOption, process, walking, recent) {
      var terminate = function () {
        return recent.fold(outcome.aborted, outcome.edge);
      };

      var recurse = function (newRecent) {
        return Gather.walk(universe, item, mode, walking).fold(
          terminate,
          function (prev) {
            return repeat(universe, prev.item(), prev.mode(), Option.none(), process, walking, newRecent);
          }
        );
      };

      if (isBoundary(universe, item)) return terminate();
      else if (! universe.property().isText(item)) return recurse(recent);
      else {
        var text = universe.property().getText(item);
        return process(universe, phase, item, text, offsetOption).fold(terminate, function () {
          return recurse(Option.some(item));
        }, outcome.success);
      }
    };

    var descendToLeft = function (universe, item, offset, isRoot) {
      var descended = Descent.toLeaf(universe, item, offset);
      if (universe.property().isText(item)) return Option.none();
      else {
        return Seeker.left(universe, descended.element(), universe.property().isText, isRoot).map(function (t) {
          return Spot.point(t, universe.property().getText(t).length);
        });
      }
    };

    var descendToRight = function (universe, item, offset, isRoot) {
      var descended = Descent.toLeaf(universe, item, offset);
      if (universe.property().isText(item)) return Option.none();
      else {
        return Seeker.right(universe, descended.element(), universe.property().isText, isRoot).map(function (t) {
          return Spot.point(t, 0);
        });
      }
    };

    var findTextNeighbour = function (universe, item, offset, isRoot) {
      return descendToLeft(universe, item, offset, isRoot).orThunk(function () {
        return descendToRight(universe, item, offset, isRoot);
      }).getOr(Spot.point(item, offset));
    };

    var repeatLeft = function (universe, item, offset, process, isRoot) {
      var initial = findTextNeighbour(universe, item, offset, isRoot);
      return repeat(universe, initial.element(), Gather.sidestep, Option.some(initial.offset()), process, walkLeft, Option.none());
    };

    var repeatRight = function (universe, item, offset, process, isRoot) {
      var initial = findTextNeighbour(universe, item, offset, isRoot);
      return repeat(universe, initial.element(), Gather.sidestep, Option.some(initial.offset()), process, walkRight, Option.none());
    };

    return {
      repeatLeft: repeatLeft,
      repeatRight: repeatRight
    };
  }
);