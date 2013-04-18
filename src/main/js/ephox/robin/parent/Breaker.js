define(
  'ephox.robin.parent.Breaker',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Option, Compare, Element, Insert, InsertAll, Node, Traverse) {
    var bisect = function (parent, child) {
      var children = Traverse.children(parent);
      var index = Arr.findIndex(children, Fun.curry(Compare.eq, child));
      return index > -1 ? Option.some({
        before: Fun.constant(children.slice(0, index)),
        after: Fun.constant(children.slice(index + 1))
      }) : Option.none();
    };

    var unsafeBreakAt = function (parent, parts) {
      var second = Element.fromDom(parent.dom().cloneNode(false));
      InsertAll.append(second, parts.after());
      Insert.after(parent, second);
      return second;
    };

    var breakAt = function (parent, child) {
      var parts = bisect(parent, child);
      return parts.map(function (ps) {
        return unsafeBreakAt(parent, ps);
      });
    };

    return {
      breakAt: breakAt
    };
  }
);
