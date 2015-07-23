define(
  'ephox.phoenix.api.general.Extract',

  [
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.extract.ExtractText',
    'ephox.phoenix.extract.Find'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Extract, ExtractText, Find) {

    var from = function (universe, item, optimise) {
      return Extract.typed(universe, item, optimise);
    };

    var all = function (universe, item, optimise) {
      return Extract.items(universe, item, optimise);
    };

    var extract = function (universe, child, offset, optimise) {
      return Extract.extract(universe, child, offset, optimise);
    };

    var extractTo = function (universe, child, offset, pred, optimise) {
      return Extract.extractTo(universe, child, offset, pred);
    };

    var find = function (universe, parent, offset, optimise) {
      return Find.find(universe, parent, offset, optimise);
    };

    var toText = function (universe, item, optimise) {
      return ExtractText.from(universe, item, optimise);
    };

    return {
      extract: extract,
      extractTo: extractTo,
      all: all,
      from: from,
      find: find,
      toText: toText
    };
  }
);
