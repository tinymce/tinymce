define(
  'ephox.phoenix.wrap.Wrapper',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Split',
    'ephox.phoenix.util.Contiguous',
    'ephox.phoenix.wrap.Navigation'
  ],

  function (Arr, Option, Spot, Split, Contiguous, Navigation) {
    /**
     * Wrap all text nodes between two DOM positions, using the nu() wrapper
     */
    var wrapWith = function (universe, base, baseOffset, end, endOffset, nu) {
      var nodes = Split.range(universe, base, baseOffset, end, endOffset);
      return wrapper(universe, nodes, nu);
    };

    /**
     * Wrap non-empty text nodes using the nu() wrapper
     */
    var wrapper = function (universe, wrapped, nu) {
      if (wrapped.length === 0) return wrapped;

      var filtered = Arr.filter(wrapped, function (x) {
        return universe.property().isText(x) && universe.property().getText(x).length > 0;
      });

      return Arr.map(filtered, function (w) {
        var container = nu();
        universe.insert().before(w, container.element());
        container.wrap(w);
        return container.element();
      });
    };

    /**
     * Return the cursor positions at the start and end of a collection of wrapper elements
     */
    var endPoints = function (universe, wrapped) {
      return Option.from(wrapped[0]).map(function (first) {
        var last = Navigation.toLast(universe, wrapped[wrapped.length - 1]);
        return Spot.points(
          Spot.point(first, 0),
    /**
     *
     */
          Spot.point(last.element(), last.offset())
        );
      });
    };

    /**
     * Calls wrapWith() on text nodes in the range, and returns the end points
     */
    var leaves = function (universe, base, baseOffset, end, endOffset, nu) {
      var start = Navigation.toLeaf(universe, base, baseOffset);
      var finish = Navigation.toLeaf(universe, end, endOffset);

      var wrapped = wrapWith(universe, start.element(), start.offset(), finish.element(), finish.offset(), nu);
      return endPoints(universe, wrapped);
    };

    var reuse = function (universe, base, baseOffset, end, endOffset, predicate, nu) {
      var start = Navigation.toLeaf(universe, base, baseOffset);
      var finish = Navigation.toLeaf(universe, end, endOffset);
      var nodes = Split.range(universe, base, baseOffset, end, endOffset);
      console.log('nodes: ', Arr.map(nodes, function (n) { return n.dom(); }));

      var groups = viper(universe, nodes);

      var yeti = function (group) {
        var container = nu();
        universe.insert().before(group.children[0], container.element());
        Arr.each(group.children, container.wrap);
        return container.element();
      };

      return Arr.map(groups, function (group) {
        var children = universe.property().children(group.parent);
        if (children.length === group.children.length) {
          // return parent if it is a span, otherwise make a nu one.
          if (predicate(group.parent)) {
            return group.parent;
          } else {
            return yeti(group);
          }
        } else {
          return yeti(group);
        }
      });
    };

    return {
      wrapWith: wrapWith,
      wrapper: wrapper,
      leaves: leaves,
      reuse: reuse
    };

  }
);
