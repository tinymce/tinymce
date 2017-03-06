define(
  'ephox.alloy.dragging.common.SnapSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.view.Scroll',
    'global!window'
  ],

  function (FieldSchema, Fun, Scroll, window) {
    var defaultLazyViewport = function () {
      var scroll = Scroll.get();

      return {
        x: scroll.left,
        y: scroll.top,
        w: Fun.constant(window.innerWidth),
        h: Fun.constant(window.innerHeight),
        fx: Fun.constant(0),
        fy: Fun.constant(0)
      };
    };
    
    return FieldSchema.optionObjOf('snaps', [
      FieldSchema.strict('getSnapPoints'),
      FieldSchema.defaulted('onSensor', Fun.noop),
      FieldSchema.strict('leftAttr'),
      FieldSchema.strict('topAttr'),
      FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
    ]);
  }
);
