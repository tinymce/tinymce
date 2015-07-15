define(
  'ephox.phoenix.api.dom.DomExtract',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Extract'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Extract) {

    var universe = DomUniverse();

    var from = function (element, skipper) {
      return Extract.from(universe, element, skipper);
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

    var toText = function (element) {
      return Extract.toText(universe, element);
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
