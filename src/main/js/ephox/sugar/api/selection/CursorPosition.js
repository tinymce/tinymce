define(
  'ephox.sugar.api.selection.CursorPosition',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Awareness'
  ],

  function (Option, PredicateFind, Traverse, Awareness) {
    var first = function (element) {
      return PredicateFind.descendant(element, Awareness.isCursorPosition);
    };

    var last = function (element) {
      return descendantRtl(element, Awareness.isCursorPosition);
    };

    // Note, sugar probably needs some RTL traversals.
    var descendantRtl = function (scope, predicate) {
      var descend = function (element) {
        var children = Traverse.children(element);
        for (var i = children.length - 1; i >= 0; i--) {
          var child = children[i];
          if (predicate(child)) return Option.some(child);
          var res = descend(child);
          if (res.isSome()) return res;
        }

        return Option.none();
      };

      return descend(scope);
    };

    return {
      first: first,
      last: last
    };
  }
);
