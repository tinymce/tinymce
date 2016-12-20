define(
  'ephox.sugar.impl.ClosestOrAncestor',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Option'
  ],

  function (Type, Option) {
    return function (is, ancestor, scope, a, isRoot) {
      return is(scope, a) ?
              Option.some(scope) :
              Type.isFunction(isRoot) && isRoot(scope) ?
                  Option.none() :
                  ancestor(scope, a, isRoot);
    };
  }
);