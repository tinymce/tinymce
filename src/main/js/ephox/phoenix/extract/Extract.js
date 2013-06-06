define(
  'ephox.phoenix.extract.Extract',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.compass.Arr',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.ghetto.extract.GhettoExtract',
    'ephox.phoenix.util.doc.List',
    'ephox.phoenix.util.node.Classification',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.PredicateFind',
    'ephox.sugar.api.Traverse'
  ],

  function (DomUniverse, Arr, Spot, GhettoExtract, List, Classification, Node, PredicateFind, Traverse) {

    var from = function (element) {
      return GhettoExtract.typed(DomUniverse(), element);
    };

    var all = function (element) {
      return GhettoExtract.items(DomUniverse(), element);
    };

    var extractToElem = function (child, offset, element) {
      var extractions = from(element);
      var prior = List.dropUntil(extractions, child);
      var count = List.count(prior);
      return Spot.point(element, count + offset);
    };

    var extract = function (child, offset) {
      return GhettoExtract.extract(DomUniverse(), child, offset);
    };

    var extractTo = function (child, offset, pred) {
      // return Spot.point(child, offset);
      return PredicateFind.ancestor(child, pred).fold(function () {
        return Spot.point(child, offset);
      }, function (v) {
        return extractToElem(child, offset, v);
      });
    };

    return {
      extract: extract,
      extractTo: extractTo,
      all: all,
      from: from
    };
  }
);
