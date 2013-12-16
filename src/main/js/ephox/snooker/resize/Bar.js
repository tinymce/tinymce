define(
  'ephox.snooker.resize.Bar',

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
        left: x - w/2,
        top: y,
        height: h,
        width: w
      });

      Attr.set(blocker, 'data-column', column);
      return blocker;
    };
  }
);
