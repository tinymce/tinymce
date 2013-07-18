define(
  'ephox.phoenix.gather.Neighbour',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.GatherResult',
    'ephox.phoenix.gather.Gather',
    'ephox.phoenix.gather.Traversal'
  ],

  function (Fun, Option, GatherResult, Gather, Traversal) {

    var ignore = function () {
      return GatherResult([], true);
    };

    var one = function (universe, element) {
      var children = universe.property().children(element);
      return children.length === 0 ? Option.some([element]) : Option.none();
    };

    var transform = function (universe, iter, element, prune) {
      var children = universe.property().children(element);
      var transformer = Fun.curry(transform, universe);
      return children.length === 0 ? GatherResult([element], true) : iter(children, transformer, prune);
    };

    var before = function (universe, element, isRoot) {
      var transformer = Fun.curry(transform, universe);
      var left = Gather.traverse(universe, Traversal.left(), element, {
        left: Fun.curry(one, universe),
        right: ignore,
        stop: isRoot !== undefined ? isRoot : Fun.constant(false)
      }, transformer);
      return Option.from(left[0]);
    };

    var after = function (universe, element, isRoot) {
      var transformer = Fun.curry(transform, universe);
      var right = Gather.traverse(universe, Traversal.right(), element, {
        left: ignore,
        right: Fun.curry(one, universe),
        stop: isRoot !== undefined ? isRoot : Fun.constant(false)
      }, transformer);
      return Option.from(right[0]);
    };

    return {
      before: before,
      after: after
    };
  }
);
