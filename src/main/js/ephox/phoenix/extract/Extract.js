define(
  'ephox.phoenix.extract.Extract',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.data.DocElement',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.util.doc.List',
    'ephox.phoenix.util.node.Classification',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.PredicateFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, DocElement, Spot, List, Classification, Node, PredicateFind, Traverse) {

    var from = function (element) {
      if (Node.isText(element)) {
        return [ DocElement.text(element) ];
      } else if (Classification.isEmpty(element)) {
        return [ DocElement.empty(element) ];
      } else if (Node.isElement(element)) {
        var children = Traverse.children(element);
        var current = Classification.isBoundary(element) ? [DocElement.boundary()] : [];
        var rest = Arr.bind(children, from);
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
      var parent = Traverse.parent(child).getOrDie('No parent for element.');
      return extractToElem(child, offset, parent);
    };

    var extractTo = function (child, offset, pred) {
      var parent = PredicateFind.ancestor(child, pred).getOrDie('No parent matching predicate.');
      return extractToElem(child, offset, parent);
    };

    return {
      extract: extract,
      extractTo: extractTo,
      from: from
    };
  }
);
