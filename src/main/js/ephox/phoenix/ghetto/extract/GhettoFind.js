define(
  'ephox.phoenix.ghetto.extract.GhettoFind',

  [
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.ghetto.extract.GhettoExtract',
    'ephox.phoenix.util.doc.List',
    'ephox.polaris.api.PositionArray'
  ],

  function (Spot, GhettoExtract, List, PositionArray) {
    var find = function (universe, parent, offset) {
      var extractions = GhettoExtract.typed(universe, parent);

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
