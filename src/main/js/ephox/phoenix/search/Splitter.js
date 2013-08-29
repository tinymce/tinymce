define(
  'ephox.phoenix.search.Splitter',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.polaris.api.PositionArray',
    'ephox.polaris.api.Strings'
  ],

  function (Arr, Option, Spot, PositionArray, Strings) {

    var subdivide = function (universe, item, positions) {
      var text = universe.property().getText(item);
      var pieces = Arr.filter(Strings.splits(text, positions), function (section) {
        return section.length > 0;
      });

      if (pieces.length <= 1) return [ Spot.range(item, 0, text.length) ];
      universe.property().setText(item, pieces[0]);

      var others = PositionArray.generate(pieces.slice(1), function (a, start) {
        var nu = universe.create().text(a);
        var result = Spot.range(nu, start, start + a.length);
        return Option.some(result);
      }, pieces[0].length);

      var otherItems = Arr.map(others, function (a) { return a.element(); });
      universe.insert().afterAll(item, otherItems);

      return [ Spot.range(item, 0, pieces[0].length) ].concat(others);
    };

    return {
      subdivide: subdivide
    };

  }
);
