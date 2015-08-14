define(
  'ephox.robin.api.general.TextSearch',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Gather',
    'ephox.robin.textdata.TextSearch',
    'ephox.robin.textdata.TextSeeker',
    'ephox.scullion.Contracts'
  ],

  function (Fun, Option, Spot, Gather, TextSearch, TextSeeker, Contracts) {
    var seekerSig = Contracts.exactly([ 'regex', 'attempt' ]);

    var previousChar = function (text, offset) {
      return TextSearch.previous(text, offset);
    };

    var nextChar = function (text, offset) {
      return TextSearch.next(text, offset);
    };

    var repeatLeft = function (universe, item, offset, process) {
      return TextSeeker.repeatLeft(universe, item, offset, process);
    };

    var repeatRight = function (universe, item, offset, process) {
      return TextSeeker.repeatRight(universe, item, offset, process);
    };

    var expandLeft = function (universe, item, offset, rawSeeker) {
      var seeker = seekerSig(rawSeeker);

      var process = function (uni, phase, pItem, pText, pOffset) {
        var lastOffset = pOffset.getOr(pText.length);
        return TextSearch.rfind(pText.substring(0, lastOffset), seeker.regex()).fold(function () {
          // Did not find a word break, so continue;
          return phase.kontinue();
        }, function (index) {
          return seeker.attempt(phase, pItem, pText, index);
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
          return seeker.attempt(phase, pItem, pText, firstOffset + index);
        });
      };

      return repeatRight(universe, item, offset, process);
    };

    // Identify the (element, offset) pair ignoring potential fragmentation. Follow the offset
    // through until the offset left is 0. This is designed to find text node positions that
    // have been fragmented.
    var scanRight = function (universe, item, originalOffset) {
      var isRoot = Fun.constant(false);
      if (! universe.property().isText(item)) return Option.none();
      var text = universe.property().getText(item);
      if (originalOffset <= text.length) return Option.some(Spot.point(item, originalOffset));
      else return Gather.seekRight(universe, item, universe.property().isText, isRoot).bind(function (next) {
        return scanRight(universe, next, originalOffset - text.length);
      });
    };

    return {
      previousChar: previousChar,
      nextChar: nextChar,
      repeatLeft: repeatLeft,
      repeatRight: repeatRight,
      expandLeft: expandLeft,
      expandRight: expandRight,
      scanRight: scanRight
    };
  }
);