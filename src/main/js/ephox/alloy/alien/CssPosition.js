define(
  'ephox.alloy.alien.CssPosition',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Adt',
    'ephox.sugar.api.view.Position'
  ],

  function (Arr, Fun, Adt, Position) {
    var adt = Adt.generate([
      { screen: [ 'point' ] },
      { absolute: [ 'point', 'scrollLeft', 'scrollTop' ] }
    ]);

    var toFixed = function (pos) {
      // TODO: Use new ADT methods
      return pos.fold(
        Fun.identity,
        function (point, scrollLeft, scrollTop) {
          return point.translate(-scrollLeft, -scrollTop);
        }
      );
    };

    var toAbsolute = function (pos) {
      return pos.fold(
        Fun.identity,
        function (point, scrollLeft, scrollTop) {
          return point;
        }
      );
    };

    var sum = function (points) {
      return Arr.foldl(points, function (b, a) {
        return b.translate(a.left(), a.top());
      }, Position(0, 0));
    };

    var sumAsFixed = function (positions) {
      var points = Arr.map(positions, toFixed);
      return sum(points);
    };

    var sumAsAbsolute = function (positions) {
      var points = Arr.map(positions, toAbsolute);
      return sum(points);
    };

    return {
      sumAsFixed: sumAsFixed,
      sumAsAbsolute: sumAsAbsolute,
      screen: adt.screen,
      absolute: adt.absolute
    };
  }
);