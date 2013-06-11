define(
  'ephox.phoenix.extract.Find',

  [
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.extract.TypedList',
    'ephox.polaris.api.PositionArray'
  ],

  function (Spot, Extract, TypedList, PositionArray) {
    var find = function (universe, parent, offset) {
      var extractions = Extract.typed(universe, parent);

      var parray = PositionArray.generate(extractions, TypedList.gen);
      var spot = PositionArray.get(parray, offset);
      return spot.map(function (v) {
        return Spot.point(v.element(), offset - v.start());
      });
    };

    return {
      find: find
    };

  }
);
