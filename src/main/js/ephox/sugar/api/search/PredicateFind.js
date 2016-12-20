define(
  'ephox.sugar.api.search.PredicateFind',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.impl.ClosestOrAncestor'
  ],

  function (Type, Arr, Fun, Option, Body, Compare, Element, ClosestOrAncestor) {
    var first = function (predicate) {
      return descendant(Body.body(), predicate);
    };

    var ancestor = function (scope, predicate, isRoot) {
      var element = scope.dom();
      var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

      while (element.parentNode) {
        element = element.parentNode;
        var el = Element.fromDom(element);

        if (predicate(el)) return Option.some(el);
        else if (stop(el)) break;
      }
      return Option.none();
    };

    var closest = function (scope, predicate, isRoot) {
      // This is required to avoid ClosestOrAncestor passing the predicate to itself
      var is = function (scope) {
        return predicate(scope);
      };
      return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
    };

    var sibling = function (scope, predicate) {
      var element = scope.dom();
      if (!element.parentNode) return Option.none();

      return child(Element.fromDom(element.parentNode), function (x) {
        return !Compare.eq(scope, x) && predicate(x);
      });
    };

    var child = function (scope, predicate) {
      var result = Arr.find(scope.dom().childNodes,
        Fun.compose(predicate, Element.fromDom));
      return result.map(Element.fromDom);
    };

    var descendant = function (scope, predicate) {
      var descend = function (element) {
        for (var i = 0; i < element.childNodes.length; i++) {
          if (predicate(Element.fromDom(element.childNodes[i])))
            return Option.some(Element.fromDom(element.childNodes[i]));

          var res = descend(element.childNodes[i]);
          if (res.isSome())
            return res;
        }

        return Option.none();
      };

      return descend(scope.dom());
    };

    return {
      first: first,
      ancestor: ancestor,
      closest: closest,
      sibling: sibling,
      child: child,
      descendant: descendant
    };
  }
);
