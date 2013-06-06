define(
  'ephox.phoenix.api.DomExtract',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.Extract'
  ],

  function (DomUniverse, Extract) {

    var universe = DomUniverse();

    var from = function (element) {
      return Extract.from(universe, element);
    };

    var all = function (element) {
      return Extract.all(universe, element);
    };

    var extract = function (child, offset) {
      return Extract.extract(universe, child, offset);
    };

    var extractTo = function (child, offset, pred) {
      return Extract.extractTo(universe, child, offset, pred);
    };

    var find = function (parent, offset) {
      return Extract.find(universe, parent, offset);
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
