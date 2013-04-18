define(
  'ephox.robin.api.Textdata',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Option, Spot, PositionArray, Compare, Node, Text) {
    var get = function (elements) {
      var list =  PositionArray.make(elements, function (x, start) {
        return Node.isText(x) ? Option.some(Spot.range(x, start, start + Text.get(x).length)) : Option.none();
      });

      var allText = Arr.foldr(list, function (b, a) {
        return Text.get(a.element()) + b;
      }, '');

      return {
        list: Fun.constant(list),
        text: Fun.constant(allText)
      };
    };

    var cursor = function (data, current, offset) {
      // FIX: Breaking abstraction.
      var element = Option.from(Arr.find(data.list(), function (x) {
        return Compare.eq(x.element(), current);
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

    var from = function (elements, current, offset) {
      var data = get(elements);
      return cursor(data, current, offset);
    };

    return {
      from: from
    };
  }
);
