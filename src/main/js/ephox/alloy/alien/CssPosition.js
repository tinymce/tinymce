define(
  'ephox.alloy.alien.CssPosition',

  [
    'ephox.compass.Arr',
    'ephox.scullion.ADT',
    'ephox.sugar.alien.Position'
  ],

  function (Arr, Adt, Position) {
    var adt = Adt.generate([
      { screen: [ 'point' ] },
      { absolute: [ 'point', 'scrollLeft', 'scrollTop' ] }
    ]);


    var toFixed = function (pos) {
      return pos.fold(
        function (point) {
          // 
          return point;
        },
        function (point, scrollLeft, scrollTop) {
          return point.translate(-scrollLeft, -scrollTop);
        }
      );
    };

    var toAbsolute = function (pos) {
      return pos.fold(
        function (point) {
          //
          return point;
        },
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