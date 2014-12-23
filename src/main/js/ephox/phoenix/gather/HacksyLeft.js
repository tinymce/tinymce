define(
  'ephox.phoenix.gather.HacksyLeft',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    var backtrack = function (universe, item) {
      return universe.query().prevSibling(item).orThunk(function () {
        return universe.property().parent(item).bind(function (parent) {
          return backtrack(universe, parent);
        });
      });
    };

    var advance = function (universe, item) {
      var children = universe.property().children(item);
      return children.length > 0 ? Option.some(children[children.length - 1]) : Option.none();
    };

    return {
      backtrack: backtrack,
      advance: advance
    };
  }
);