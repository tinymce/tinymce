define(
  'ephox.phoenix.gather.Neighbour',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Gather',
    'ephox.phoenix.gather.GatherResult',
    'ephox.phoenix.gather.Traversal',
    'ephox.sugar.api.Traverse'
  ],

  function (Fun, Option, Gather, GatherResult, Traversal, Traverse) {

    var ignore = function () {
      return GatherResult([], true);
    };

    var one = function (element) {
      var children = Traverse.children(element);
      return children.length === 0 ? Option.some([element]) : Option.none();
    };

    var transform = function (iter, element, prune) {
      var children = Traverse.children(element);
      return children.length === 0 ? GatherResult([element], true) : iter(children, transform, prune);
    };

    var before = function (element) {
      var left = Gather.traverse(Traversal.left(), element, {
        left: one,
        right: ignore,
        stop: Fun.constant(false)
      }, transform);
      return Option.from(left[0]);
    };

    var after = function (element) {
      var right = Gather.traverse(Traversal.right(), element, {
        left: ignore,
        right: one,
        stop: Fun.constant(false)
      }, transform);
      return Option.from(right[0]);
    };

    return {
      before: before,
      after: after
    };
  }
);
