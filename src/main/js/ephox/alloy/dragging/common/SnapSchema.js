define(
  'ephox.alloy.dragging.common.SnapSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.view.Scroll',
    'global!window'
  ],

  function (Fields, FieldSchema, Fun, Scroll, window) {
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
      Fields.onHandler('onSensor'),
      FieldSchema.strict('leftAttr'),
      FieldSchema.strict('topAttr'),
      FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
    ]);
  }
);
