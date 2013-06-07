define(
  'ephox.phoenix.ghetto.wrap.GhettoWrapper',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.ghetto.wrap.GhettoIdentify'
  ],

  function (Arr, GhettoIdentify) {
    var wrapWith = function (universe, base, baseOffset, end, endOffset, nu) {
      var nodes = GhettoIdentify.nodes(universe, base, baseOffset, end, endOffset);
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

    return {
      wrapWith: wrapWith,
      wrapper: wrapper
    };

  }
);
