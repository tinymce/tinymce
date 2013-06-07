define(
  'ephox.phoenix.extract.Find',

  [
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.util.doc.List',
    'ephox.polaris.api.PositionArray'
  ],

  function (Spot, Extract, List, PositionArray) {
    var find = function (universe, parent, offset) {
      var extractions = Extract.typed(universe, parent);

      var list = PositionArray.generate(extractions, List.gen);
      var spot = PositionArray.get(list, offset);
      return spot.map(function (v) {
        return Spot.point(v.element(), offset - v.start());
      });
    };

    return {
      find: find
    };

  }
);
