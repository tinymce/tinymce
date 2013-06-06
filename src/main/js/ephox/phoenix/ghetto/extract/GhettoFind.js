define(
  'ephox.phoenix.ghetto.extract.GhettoFind',

  [
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.ghetto.extract.GhettoExtract',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.phoenix.util.doc.List'
  ],

  function (Spot, GhettoExtract, PositionArray, List) {
    var find = function (universe, parent, offset) {
      var extractions = GhettoExtract.typed(universe, parent);

      var list = PositionArray.make(extractions, List.gen);
      var spot = PositionArray.getAt(list, offset);
      return spot.map(function (v) {
        return Spot.point(v.element(), offset - v.start());
      });
    };

    return {
      find: find
    };

  }
);
