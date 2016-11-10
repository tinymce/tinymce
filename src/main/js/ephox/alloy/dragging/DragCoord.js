define(
  'ephox.alloy.dragging.DragCoord',

  [
    'ephox.compass.Arr',
    'ephox.scullion.ADT',
    'ephox.sugar.alien.Position'
  ],

  function (Arr, Adt, Position) {
    var adt = Adt.generate([
      { offset: [ 'x', 'y' ] },
      { absolute: [ 'x', 'y' ] },
      { fixed: [ 'x', 'y' ] }
    ]);

    var subtract = function (change) {
      return function (point) {
        return point.translate(-change.left(), -change.top());
      };
    };

    var add = function (change) {
      return function (point) {
        return point.translate(change.left(), change.top());
      };
    };

    var transform = function (changes) {
      return function (x, y) {
        return Arr.foldl(changes, function (rest, f) {
          return f(rest);
        }, Position(x, y));
      };
    };

    var asFixed = function (coord, scroll, origin) {
      return coord.fold(
        // offset to fixed
        transform([ add(origin), subtract(scroll) ]),
        // absolute to fixed
        transform([ subtract(scroll) ]),
        // fixed to fixed
        transform([ ])
      );
    };

    var asAbsolute = function (coord, scroll, origin) {
      return coord.fold(
        // offset to absolute
        transform([ add(origin) ]),
        // absolute to absolute
        transform([ ]),
        // fixed to absolute
        transform([ add(scroll) ])
      );
    };

    var asOffset = function (coord, scroll, origin) {
      return coord.fold(
        // offset to offset
        transform([ ]),
        // absolute to offset
        transform([ subtract(origin) ]),
        // fixed to offset
        transform([ add(scroll), subtract(origin) ])
      );
    };

    return {
      offset: adt.offset,
      absolute: adt.absolute,
      fixed: adt.fixed,

      asFixed: asFixed,
      asAbsolute: asAbsolute,
      asOffset: asOffset
    };
  }
);