define(
  'ephox.robin.util.ContextUtil',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.robin.data.ContextGather',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Option, Spot, PositionArray, ContextGather, Compare, Node, Text) {
    var analyse = function (elements, current, offset) {
      var list =  PositionArray.make(elements, function (x, start) {
        return Node.isText(x) ? Option.some(Spot.range(x, start, start + Text.get(x).length)) : Option.none();
      });

      var allText = Arr.foldr(list, function (b, a) {
        return Text.get(a.element()) + b;
      }, '');
      // FIX: Breaking abstraction.
      var currentElem = Option.from(Arr.find(list, function (x) {
        return Compare.eq(x.element(), current);
      }));
      var position = currentElem.map(function (v) {
        return v.start() + offset;
      });

      return ContextGather(list, allText, position);
    };

    return {
      analyse: analyse
    };
  }
);
