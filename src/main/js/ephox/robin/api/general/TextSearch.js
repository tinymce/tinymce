define(
  'ephox.robin.api.general.TextSearch',

  [
    'ephox.robin.textdata.TextSearch',
    'ephox.robin.textdata.TextSeeker',
    'ephox.scullion.Contracts'
  ],

  function (TextSearch, TextSeeker, Contracts) {
    var seekerSig = Contracts.exactly([ 'regex', 'attempt' ]);

    var previousChar = function (text, offset) {
      return TextSearch.previous(text, offset);
    };

    var nextChar = function (text, offset) {
      return TextSearch.next(text, offset);
    };

    var repeatLeft = function (universe, item, offset, process, isRoot) {
      return TextSeeker.repeatLeft(universe, item, offset, process, isRoot);
    };

    var repeatRight = function (universe, item, offset, process, isRoot) {
      return TextSeeker.repeatRight(universe, item, offset, process, isRoot);
    };

    var expandLeft = function (universe, item, offset, rawSeeker, isRoot) {
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
      return repeatLeft(universe, item, offset, process, isRoot);
    };

    var expandRight = function (universe, item, offset, rawSeeker, isRoot) {
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

      return repeatRight(universe, item, offset, process, isRoot);
    };

    return {
      previousChar: previousChar,
      nextChar: nextChar,
      repeatLeft: repeatLeft,
      repeatRight: repeatRight,
      expandLeft: expandLeft,
      expandRight: expandRight
    };
  }
);