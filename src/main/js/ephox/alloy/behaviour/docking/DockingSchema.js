define(
  'ephox.alloy.behaviour.docking.DockingSchema',

  [
    'ephox.alloy.alien.Boxes',
    'ephox.boulder.api.FieldSchema',
    'ephox.sugar.api.Scroll',
    'global!window'
  ],

  function (Boxes, FieldSchema, Scroll, window) {
    var defaultLazyViewport = function (_component) {
      var scroll = Scroll.get();
      return Boxes.bounds(scroll.left(), scroll.top(), window.innerWidth, window.innerHeight);
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