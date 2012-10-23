define(
  'ephox.phoenix.rye.Rye',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Gather',
    'ephox.phoenix.gather.GatherResult',
    'ephox.phoenix.util.node.Classification',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text',
    'ephox.sugar.api.Traverse'
  ],

  function (Fun, Option, Gather, GatherResult, Classification, Node, Text, Traverse) {

    var stop = function (element) {
      return Classification.isBoundary(element) || Classification.isEmpty(element);
    };

    var ignore = Fun.constant(Option.some([]));
    var first = Fun.constant(0);
    var last = function (text) { return text.length - 1; };

    var gleft = function (gathered) { return gathered.left(); };
    var gright = function (gathered) { return gathered.right(); };

    var look = function (element, g, pruner) {
      var f = function (iter, element, p) {
        var stopped = stop(element);
        return Node.isText(element) || stopped ? 
          GatherResult([], stopped) : 
          iter(Traverse.children(element), f, p);
      };
      
      var gathered = Gather.gather(element, pruner, f);
      var r = g(gathered);
      return Option.from(r[0]);
    };

    var prunes = function (offseter) {
      return function (element) {
        return Text.getOption(element).bind(function (v) {
          var offset = offseter(v);
          return v.length > 0 ? Option.some(v[offset]) : Option.none();
        });
      }
    };

    var left = function (element, offset) {
      return Text.getOption(element).bind(function (v) {
        if (offset > v.length) 
          return Option.none();
        else if (offset === 0) 
          return look(element, gleft, {
            left: prunes(last),
            right: ignore,
            stop: stop
          });
        else 
          return Option.some(v[offset - 1]);
      });
    };

    var right = function (element, offset) {
      return Text.getOption(element).bind(function (v) {
        if (offset > v.length) 
          return Option.none();
        else if (offset === v.length)
          return look(element, gright, {
            left: ignore,
            right: prunes(first),
            stop: stop
          });
        else 
          return Option.some(v[offset]);
      });
    };

    return {
      left: left,
      right: right
    };
  }
);
