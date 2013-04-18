define(
  'ephox.robin.words.Prune',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.util.node.Classification',
    'ephox.robin.util.WordUtil',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text'
  ],

  function (Fun, Option, Spot, Classification, WordUtil, Node, Text) {

    var inc = function (element, word) {
      return Node.isText(element) ? Option.some(element).bind(function (v) {
        return word(Text.get(v));
      }) : Option.none();
    };

    var stop = function (element) {
      return Classification.isEmpty(element) || Classification.isBoundary(element);
    };

    var prune = function (word, element) {
      var include = inc(element, word);
      return include.fold(function () {
        return stop(element) ? Option.some([]) : Option.none();
      }, function (v) {
        return Option.some([Spot.text(element, v)]);
      });
    };

    return {
      left: Fun.curry(prune, WordUtil.lastWord),
      right: Fun.curry(prune, WordUtil.firstWord),
      stop: stop
    };

  }
);
