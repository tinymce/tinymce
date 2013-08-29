define(
  'ephox.phoenix.wrap.Wrapper',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Split',
    'ephox.phoenix.wrap.Navigation'
  ],

  function (Arr, Option, Spot, Split, Navigation) {
    var wrapWith = function (universe, base, baseOffset, end, endOffset, nu) {
      var nodes = Split.range(universe, base, baseOffset, end, endOffset);
      return wrapper(universe, nodes, nu);
    };

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

    var endPoints = function (wrapped) {
      return Option.from(wrapped[0]).map(function (first) {
        var last = Navigation.toLast(universe, wrapped[wrapped.length - 1]);
        return Spot.points(
          Spot.point(first, 0),
          Spot.point(last.element(), last.offset())
        );
      });
    };

    var leaves = function (universe, base, baseOffset, end, endOffset, nu) {
      var start = Navigation.toLeaf(universe, base, baseOffset);
      var finish = Navigation.toLeaf(universe, end, endOffset);

      var wrapped = wrapWith(universe, start.element(), start.offset(), finish.element(), finish.offset(), nu);
      return endPoints(wrapped);
    };

    return {
      wrapWith: wrapWith,
      wrapper: wrapper,
      leaves: leaves
    };

  }
);
