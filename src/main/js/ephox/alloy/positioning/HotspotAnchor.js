define(
  'ephox.alloy.positioning.HotspotAnchor',

  [
    'ephox.alloy.positioning.Anchoring',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.Layout',
    'ephox.repartee.api.MaxHeight',
    'ephox.repartee.api.Origins'
  ],

  function (Anchoring, FieldSchema, Fun, Bubble, Layout, MaxHeight, Origins) {
    var placement = function (component, posInfo, anchorInfo, origin) {
      var hotspot = anchorInfo.hotspot();
      var anchorBox = Origins.toBox(origin, hotspot.element());

      return Anchoring({
        anchorBox: Fun.constant(anchorBox),
        bubble: Fun.constant(Bubble(0, 0)),
        maxHeightFunction: Fun.constant(MaxHeight.available()),
        layouts: Fun.constant(Layout)
      });
    };

    return [
      // FieldSchema.defaulted(/) // ui direction
      FieldSchema.strict('hotspot'),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);