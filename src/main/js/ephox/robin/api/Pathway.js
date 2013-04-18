define(
  'ephox.robin.api.Pathway',

  [
    'ephox.phoenix.gather.Gather',
    'ephox.robin.pathway.Prune',
    'ephox.robin.pathway.Simplify',
    'ephox.robin.pathway.Transform'
  ],

  function (Gather, Prune, Simplify, Transform) {
    var between = function (start, end) {
      var prune = Prune.between(start, end);
      var actual = Gather.gather(start, pruner, Transform);
      return actual.left().concat([start]).concat(actual.right());
    };

    var simplify = function (elements) {
      return Simplify.simplify(elements);
    };

    return {
      between: between,
      simplify: simplify
    };
  }
);
