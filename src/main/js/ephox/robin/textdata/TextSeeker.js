define(
  'ephox.robin.textdata.TextSeeker',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.api.general.Structure',
    'ephox.robin.textdata.TextSearch',
    'ephox.scullion.ADT',
    'ephox.scullion.Struct'
  ],

  function (Option, Gather, Structure, TextSearch, Adt, Struct) {
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
        return process(universe, item, text, offsetOption).fold(terminate, function () {
          return recurse(Option.some(item));
        }, outcome.success);
      }
    };

    var repeatLeft = function (universe, item, offset, process) {
      return repeat(universe, item, Gather.sidestep, Option.some(offset), process, walkLeft, Option.none());
    };

    var repeatRight = function (universe, item, offset, process) {
      return repeat(universe, item, Gather.sidestep, Option.some(offset), process, walkRight, Option.none());
    };

    var expandLeft = function (universe, item, offset, rawSeeker) {
      var seeker = seekerSig(rawSeeker);

      var process = function (uni, pItem, pText, pOffset) {
        var lastOffset = pOffset.getOr(pText.length);
        return TextSearch.rfind(pText.substring(0, lastOffset), seeker.regex()).fold(function () {
          // Did not find a word break, so continue;
          return phase.kontinue();
        }, function (index) {
          return seeker.attempt()(pItem, pText, index);
        });
      };
      return repeatLeft(universe, item, offset, process);
    };

    var expandRight = function (universe, item, offset, rawSeeker) {
      var seeker = seekerSig(rawSeeker);

      var process = function (uni, pItem, pText, pOffset) {
        var firstOffset = pOffset.getOr(0);
        return TextSearch.lfind(pText.substring(firstOffset), seeker.regex()).fold(function () {
          // Did not find a word break, so continue;
          return phase.kontinue();
        }, function (index) {
          return seeker.attempt()(pItem, pText, firstOffset + index);
        });
      };

      return repeatRight(universe, item, offset, process);
    };

    return {
      repeatLeft: repeatLeft,
      repeatRight: repeatRight,
      phase: phase,
      expandLeft: expandLeft,
      expandRight: expandRight
    };
  }
);