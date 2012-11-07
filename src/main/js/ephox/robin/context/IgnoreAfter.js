define(
  'ephox.robin.context.IgnoreAfter',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.gather.Gather',
    'ephox.robin.gather.Transform',
    'ephox.robin.prune.PreBlock',
    'ephox.robin.util.ContextUtil'
  ],

  function (Fun, Gather, Transform, PreBlock, ContextUtil) {

    var gather = function (transform, element) {
      var gathered = Gather.gather(element, PreBlock, transform);
      return gathered.left().concat([element]);
    };

    var deep = Fun.curry(gather, Transform.basic);
    var shallow = Fun.curry(gather, Transform.ignoreChildren);

    var context = function (element, offset) {
      var gathered = deep(element);
      return ContextUtil.analyse(gathered, element, offset);
    };

    return {
      deep: deep,
      shallow: shallow,
      context: context
    };
  }
);