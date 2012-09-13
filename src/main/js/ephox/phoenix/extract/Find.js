define(
  'ephox.phoenix.extract.Find',

  [
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.phoenix.util.doc.List'
  ],

  function (Spot, Extract, PositionArray, List) {
    var find = function (parent, offset) {
      var extractions = Extract.from(parent);

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
