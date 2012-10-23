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

    var lookLeft = function (element) {
      var gathered = Gather.gather(element, prune, f);
      console.log('gathered: ', gathered.left());
      return Option.from(gathered.left()[0]);
    };

    var safeLeft = function (element, offset) {
      var text = Text.get(element);
      if (offset > text.length) 
        return Option.none();
      else if (offset === 0) 
        return lookLeft(element);
      else 
        return Option.some(text[offset - 1]);
    };

    var left = function (element, offset) {
      return Node.isText(element) ? safeLeft(element, offset) : Option.none();
    };

    var prune = {
      left: function (element) {
        console.log('element: ', element.dom());
        if (Node.isText(element)) {
          var text = Text.get(element);
          return text.length > 0 ? Option.some(text[text.length - 1]) : Option.none();
        } else
          return Option.none();
      },

      right: function () {
        return Option.some([]);
      },

      stop: function () {
        return false;
      }
    };

    var f = function (iter, element, p) {
      return Node.isText(element) ? GatherResult([], false) : iter(Traverse.children(element), f, p);
    };

    return {
      left: left
    };
  }
);
