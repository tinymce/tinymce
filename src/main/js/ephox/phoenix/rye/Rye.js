define(
  'ephox.phoenix.rye.Rye',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Gather',
    'ephox.phoenix.gather.GatherResult',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text',
    'ephox.sugar.api.Traverse'
  ],

  function (Fun, Option, Gather, GatherResult, Node, Text, Traverse) {

    var stop = Fun.constant(false);
    var ignore = Fun.constant(Option.some([]));

    var gleft = function (gathered) {
      return gathered.left();
    };

    var gright = function (gathered) {
      return gathered.right();
    };

    var look = function (element, pruner, g) {
      var gathered = Gather.gather(element, pruner, f);
      var r = g(gathered);
      return Option.from(r[0]);
    };

    var left = function (element, offset) {
      return Text.getOption(element).bind(function (v) {
        if (offset > v.length) 
          return Option.none();
        else if (offset === 0) 
          return look(element, pruneLeft, gleft);
        else 
          return Option.some(v[offset - 1]);
      });
    };

    var right = function (element, offset) {
      return Text.getOption(element).bind(function (v) {
        if (offset > v.length) 
          return Option.none();
        else if (offset === v.length)
          return look(element, pruneRight, gright);
        else 
          return Option.some(v[offset]);
      });
    };

    var first = Fun.constant(0);
    var last = function (text) {
      return text.length - 1;
    };

    var prunes = function (offseter) {
      return function (element) {
        return Text.getOption(element).bind(function (v) {
          var offset = offseter(v);
          return v.length > 0 ? Option.some(v[offset]) : Option.none();
        });
      }
    };

    var pruneLeft = {
      left: prunes(last),
      right: ignore,
      stop: stop
    };

    var pruneRight = {
      left: ignore,
      right: prunes(first),
      stop: stop
    }

    var f = function (iter, element, p) {
      return Node.isText(element) ? GatherResult([], false) : iter(Traverse.children(element), f, p);
    };

    return {
      left: left,
      right: right
    };
  }
);
