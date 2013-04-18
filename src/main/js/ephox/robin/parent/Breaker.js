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
      return index > -1 ? {
        before: Fun.constant(children.slice(0, index)),
        after: Fun.constant(children.slice(index + 1))
      } : {
        before: Fun.constant(children),
        after: Fun.constant([])
      };
    };

    var unsafeBreakAt = function (parent, parts) {
      var tag = Node.name(parent);
      var second = Element.fromTag(tag);
      InsertAll.append(second, parts.after());
      Insert.after(parent, second);
      return Option.some(second);
    };

    var breakAt = function (parent, child) {
      var parts = bisect(parent, child);
      return parts.after().length > 0 ? unsafeBreakAt(parent, parts) : Option.none();
    };

    return {
      breakAt: breakAt
    };
  }
);
