define(
  'ephox.phoenix.ghetto.extract.GhettoExtract',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.ghetto.extract.TypedItem'
  ],

  function (Arr, TypedItem) {
    var from = function (universe, item) {
      if (universe.property().isText(item)) {
        return [ TypedItem.text(item, universe) ];
      } else if (universe.property().isEmptyTag(item)) {
        return [ TypedItem.empty(item, universe) ];
      } else if (universe.property().isElement(item)) {
        var children = universe.property().children(item);
        var current = universe.property().isBoundary(item) ? [TypedItem.boundary(item, universe)] : [];
        var rest = Arr.bind(children, function (child) {
          return from(universe, child);
        });
        return current.concat(rest).concat(current);
      } else {
        return [];
      }
    };

    return {
      from: from
    };
  }
);
