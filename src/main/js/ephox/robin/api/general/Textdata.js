define(
  'ephox.robin.api.general.Textdata',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.polaris.api.PositionArray'
  ],

  function (Arr, Fun, Option, Spot, PositionArray) {
    var get = function (universe, elements) {
      var list =  PositionArray.generate(elements, function (x, start) {
        return universe.property().isText(x) ?
          Option.some(Spot.range(x, start, start + universe.property().getText(x).length)) :
          Option.none();
      });

      var allText = Arr.foldr(list, function (b, a) {
        return universe.property().getText(a.element()) + b;
      }, '');

      return {
        list: Fun.constant(list),
        text: Fun.constant(allText)
      };
    };

    var cursor = function (universe, data, current, offset) {
      // FIX: Breaking abstraction.
      var element = Option.from(Arr.find(data.list(), function (x) {
        return universe.eq(x.element(), current);
      }));

      var position = element.map(function (v) {
        return v.start() + offset;
      });

      return {
        list: data.list,
        text: data.text,
        cursor: Fun.constant(position)
      };
    };

    var from = function (universe, elements, current, offset) {
      var data = get(universe, elements);
      return cursor(universe, data, current, offset);
    };

    return {
      from: from
    };
  }
);
