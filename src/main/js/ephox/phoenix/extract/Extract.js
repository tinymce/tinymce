define(
  'ephox.phoenix.extract.Extract',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.extract.GhettoExtract'
  ],

  function (DomUniverse, GhettoExtract) {

    var from = function (element) {
      return GhettoExtract.typed(DomUniverse(), element);
    };

    var all = function (element) {
      return GhettoExtract.items(DomUniverse(), element);
    };

    var extract = function (child, offset) {
      return GhettoExtract.extract(DomUniverse(), child, offset);
    };

    var extractTo = function (child, offset, pred) {
      return GhettoExtract.extractTo(DomUniverse(), child, offset, pred);
    };

    return {
      extract: extract,
      extractTo: extractTo,
      all: all,
      from: from
    };
  }
);
