define(
  'ephox.robin.api.dom.DomTextSearch',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.TextSearch'
  ],

  function (DomUniverse, TextSearch) {
    var universe = DomUniverse();

    var previousChar = function (text, offset) {
      return TextSearch.previousChar(text, offset);
    };

    var nextChar = function (text, offset) {
      return TextSearch.nextChar(text, offset);
    };

    var repeatLeft = function (item, offset, process) {
      return TextSearch.repeatLeft(universe, item, offset, process);
    };

    var repeatRight = function (item, offset, process) {
      return TextSearch.repeatRight(universe, item, offset, process);
    };

    var expandLeft = function (item, offset, rawSeeker) {
      return TextSearch.expandLeft(universe, item, offset, rawSeeker);
    };

    var expandRight = function (item, offset, rawSeeker) {
      return TextSearch.expandRight(universe, item, offset, rawSeeker);
    };

    var scanRight = function (item, offset) {
      return TextSearch.scanRight(universe, item, offset);
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