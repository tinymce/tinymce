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
      return GhettoExtract.from(DomUniverse(), element);
    };

    var all = function (element) {
      if (Node.isText(element)) {
        return [ element ];
      } else if (Classification.isEmpty(element)) {
        return [ element ];
      } else if (Node.isElement(element)) {
        var children = Traverse.children(element);
        var current = Classification.isBoundary(element) ? [element] : [];
        var rest = Arr.bind(children, all);
        return current.concat(rest).concat(current);
      } else {
        return [];
      }
    };

    var extractToElem = function (child, offset, element) {
      var extractions = from(element);
      var prior = List.dropUntil(extractions, child);
      var count = List.count(prior);
      return Spot.point(element, count + offset);
    };

    var extract = function (child, offset) {
      return Traverse.parent(child).fold(function () {
        return Spot.point(child, offset);
      }, function (v) {
        return extractToElem(child, offset, v);
      });
    };

    var extractTo = function (child, offset, pred) {
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
