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

    var repeatLeft = function (item, offset, process, isRoot) {
      return TextSearch.repeatLeft(universe, item, offset, process, isRoot);
    };

    var repeatRight = function (item, offset, process, isRoot) {
      return TextSearch.repeatRight(universe, item, offset, process, isRoot);
    };

    var expandLeft = function (item, offset, rawSeeker, isRoot) {
      return TextSearch.expandLeft(universe, item, offset, rawSeeker, isRoot);
    };

    var expandRight = function (item, offset, rawSeeker, isRoot) {
      return TextSearch.expandRight(universe, item, offset, rawSeeker, isRoot);
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