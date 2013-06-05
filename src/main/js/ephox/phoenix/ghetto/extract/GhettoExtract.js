define(
  'ephox.phoenix.ghetto.extract.GhettoExtract',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.ghetto.extract.TypedItem',
    'ephox.phoenix.util.doc.List'
  ],

  function (Arr, Spot, TypedItem, List) {
    var typed = function (universe, item) {
      if (universe.property().isText(item)) {
        return [ TypedItem.text(item, universe) ];
      } else if (universe.property().isEmptyTag(item)) {
        return [ TypedItem.empty(item, universe) ];
      } else if (universe.property().isElement(item)) {
        var children = universe.property().children(item);
        var current = universe.property().isBoundary(item) ? [TypedItem.boundary(item, universe)] : [];
        var rest = Arr.bind(children, function (child) {
          return typed(universe, child);
        });
        return current.concat(rest).concat(current);
      } else {
        return [];
      }
    };


    var items = function (universe, item) {
      if (universe.property().isText(item)) {
        return [ item ];
      } else if (universe.property().isEmptyTag(item)) {
        return [ item ];
      } else if (universe.property().isElement(item)) {
        var children = universe.property().children(item);
        var current = universe.property().isBoundary(item) ? [item] : [];
        var rest = Arr.bind(children, function (child) {
          return items(universe, child);
        });
        return current.concat(rest).concat(current);
      } else {
        return [];
      }
    };

    var extractToElem = function (universe, child, offset, item) {
      var extractions = typed(universe, item);
      var prior = List.dropUntil(extractions, child);
      var count = List.count(prior);
      console.log('prior: ', count);
      return Spot.point(item, count + offset);
    };

    var extract = function (universe, child, offset) {
      return universe.property().parent(child).fold(function () {
        return Spot.point(child, offset);
      }, function (parent) {
        return extractToElem(universe, child, offset, parent);
      });
    };

    var extractTo = function (universe, child, offset, pred) {
      return universe.up().predicate(child, pred).fold(function () {
        return Spot.point(child, offset);
      }, function (v) {
        return extractToElem(universe, child, offset, v);
      });
    };

    return {
      typed: typed,
      items: items,
      extractTo: extractTo,
      extract: extract
    };
  }
);
