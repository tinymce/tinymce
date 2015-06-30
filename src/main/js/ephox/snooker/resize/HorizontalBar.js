define(
  'ephox.snooker.resize.HorizontalBar',

  [
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element'
  ],

  function (Attr, Css, Element) {
    return function (column, x, y, w, h) {
      var blocker = Element.fromTag('div');
      Css.setAll(blocker, {
        position: 'absolute',
        left: x + 'px',
        top: y + 'px',
        height: h + 'px',
        width: w + 'px'
      });

      Attr.set(blocker, 'data-column', column);
      return blocker;
    };
  }
);
