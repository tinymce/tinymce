define(
  'ephox.alloy.behaviour.docking.DockingSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.ego.util.Bounds',
    'ephox.sugar.api.Scroll',
    'global!window'
  ],

  function (FieldSchema, Bounds, Scroll, window) {
    var defaultLazyViewport = function (_component) {
      var scroll = Scroll.get();
      // FIX: Non API package.
      return Bounds(scroll.left(), scroll.top(), window.innerWidth, window.innerHeight);
    };

    return [
      FieldSchema.optionObjOf('contextual', [
        FieldSchema.strict('fadeInClass'),
        FieldSchema.strict('fadeOutClass'),
        FieldSchema.strict('transitionClass'),
        FieldSchema.strict('lazyContext')
      ]),
      FieldSchema.defaulted('lazyViewport', defaultLazyViewport),
      FieldSchema.strict('leftAttr'),
      FieldSchema.strict('topAttr')
    ];
  }
);