define(
  'ephox.phoenix.wrap.Wrapper',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.wrap.Identify',
    'ephox.phoenix.wrap.Wraps',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Identify, Wraps, Insert, Text) {

    var wrap = function (base, baseOffset, end, endOffset) {
      return wrapWith(base, baseOffset, end, endOffset, Wraps.simple);
    };

    var wrapWith = function (base, baseOffset, end, endOffset, c) {
      var nodes = Identify.nodes(base, baseOffset, end, endOffset);
      return wrapper(nodes, c);
    };
    
    var wrapper = function (wrapped, c) {
      if (wrapped.length === 0) return;

      var filtered = Arr.filter(wrapped, function (x) {
        return Text.get(x).length > 0;
      });

      return Arr.map(filtered, function (w) {
        var container = c();
        Insert.before(w, container.element());
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
