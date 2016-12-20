define(
  'ephox.sugar.api.search.TransformFind',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element'
  ],

  function (Type, Fun, Option, Element) {
    var ancestor = function (scope, transform, isRoot) {
      var element = scope.dom();
      var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

      while (element.parentNode) {
        element = element.parentNode;
        var el = Element.fromDom(element);

        var transformed = transform(el);
        if (transformed.isSome()) return transformed;
        else if (stop(el)) break;
      }
      return Option.none();
    };

    var closest = function (scope, transform, isRoot) {
      var current = transform(scope);
      return current.orThunk(function () {
        return isRoot(scope) ? Option.none() : ancestor(scope, transform, isRoot);
      });
    };

    return {
      ancestor: ancestor,
      closest: closest
    };
  }
);