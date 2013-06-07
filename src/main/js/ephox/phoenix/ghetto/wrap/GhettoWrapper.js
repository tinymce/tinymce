define(
  'ephox.phoenix.ghetto.wrap.GhettoWrapper',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.ghetto.wrap.GhettoIdentify',
    'ephox.phoenix.ghetto.wrap.GhettoWraps'
  ],

  function (Arr, GhettoIdentify, GhettoWraps) {

    var wrap = function (universe, base, baseOffset, end, endOffset) {
      return wrapWith(base, baseOffset, end, endOffset, function () {
        return GhettoWraps.simple(universe);
      });
    };

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
      wrap: wrap,
      wrapWith: wrapWith,
      wrapper: wrapper
    };

  }
);
