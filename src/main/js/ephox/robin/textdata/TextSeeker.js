define(
  'ephox.robin.textdata.TextSeeker',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Descent',
    'ephox.phoenix.api.general.Gather',
    'ephox.phoenix.gather.Seeker',
    'ephox.robin.api.general.Structure',
    'ephox.robin.textdata.TextSearch',
    'ephox.scullion.ADT',
    'ephox.scullion.Struct'
  ],

  function (Fun, Option, Spot, Descent, Gather, Seeker, Structure, TextSearch, Adt, Struct) {
    var walkLeft = Gather.walkers().left();
    var walkRight = Gather.walkers().right();

    var seekerSig = Struct.immutableBag([ 'regex', 'attempt' ], [ ]);

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

    var descendToLeft = function (universe, item, offset) {
      var descended = Descent.toLeaf(universe, item, offset);
      if (universe.property().isText(item)) return Option.none();
      else {
        return Seeker.left(universe, descended.element(), universe.property().isText, Fun.curry(Structure.isBlock, universe)).map(function (t) {
          return Spot.point(t, universe.property().getText(t).length);
        });
      }
    };

    var descendToRight = function (universe, item, offset) {
      var descended = Descent.toLeaf(universe, item, offset);
      if (universe.property().isText(item)) return Option.none();
      else {
        return Seeker.right(universe, descended.element(), universe.property().isText, Fun.curry(Structure.isBlock, universe)).map(function (t) {
          return Spot.point(t, 0);
        });
      }
    };

    var findTextNeighbour = function (universe, item, offset) {
      return descendToLeft(universe, item, offset).orThunk(function () {
        return descendToRight(universe, item, offset);
      }).getOr(Spot.point(item, offset));
    };

    var repeatLeft = function (universe, item, offset, process) {
      var initial = findTextNeighbour(universe, item, offset);
      return repeat(universe, initial.element(), Gather.sidestep, Option.some(initial.offset()), process, walkLeft, Option.none());
    };

    var repeatRight = function (universe, item, offset, process) {
      var initial = findTextNeighbour(universe, item, offset);
      return repeat(universe, initial.element(), Gather.sidestep, Option.some(initial.offset()), process, walkRight, Option.none());
    };

    var expandLeft = function (universe, item, offset, rawSeeker) {
      var seeker = seekerSig(rawSeeker);

      var process = function (uni, phase, pItem, pText, pOffset) {
        var lastOffset = pOffset.getOr(pText.length);
        return TextSearch.rfind(pText.substring(0, lastOffset), seeker.regex()).fold(function () {
          // Did not find a word break, so continue;
          return phase.kontinue();
        }, function (index) {
          return seeker.attempt()(phase, pItem, pText, index);
        });
      };
      return repeatLeft(universe, item, offset, process);
    };

    var expandRight = function (universe, item, offset, rawSeeker) {
      var seeker = seekerSig(rawSeeker);

      var process = function (uni, phase, pItem, pText, pOffset) {
        var firstOffset = pOffset.getOr(0);
        return TextSearch.lfind(pText.substring(firstOffset), seeker.regex()).fold(function () {
          // Did not find a word break, so continue;
          return phase.kontinue();
        }, function (index) {
          return seeker.attempt()(phase, pItem, pText, firstOffset + index);
        });
      };

      return repeatRight(universe, item, offset, process);
    };

    return {
      repeatLeft: repeatLeft,
      repeatRight: repeatRight,
      expandLeft: expandLeft,
      expandRight: expandRight
    };
  }
);