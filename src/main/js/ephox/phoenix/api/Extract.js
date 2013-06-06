define(
  'ephox.phoenix.api.Extract',

  [
    'ephox.phoenix.ghetto.extract.GhettoExtract',
    'ephox.phoenix.ghetto.extract.GhettoFind'
  ],

  function (GhettoExtract, GhettoFind) {

    var from = function (universe, item) {
      return GhettoExtract.typed(universe, item);
    };

    var all = function (universe, item) {
      return GhettoExtract.items(universe, item);
    };

    var extract = function (universe, child, offset) {
      return GhettoExtract.extract(universe, child, offset);
    };

    var extractTo = function (universe, child, offset, pred) {
      return GhettoExtract.extractTo(universe, child, offset, pred);
    };

    var find = function (universe, parent, offset) {
      return GhettoFind.find(universe, parent, offset);
    };

    return {
      extract: extract,
      extractTo: extractTo,
      all: all,
      from: from,
      find: find
    };
  }
);
