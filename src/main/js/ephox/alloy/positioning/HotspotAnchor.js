define(
  'ephox.alloy.positioning.HotspotAnchor',

  [
    'ephox.alloy.positioning.Anchoring',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.Layout',
    'ephox.repartee.api.MaxHeight',
    'ephox.repartee.api.Origins'
  ],

  function (Anchoring, FieldSchema, Fun, Option, Bubble, Layout, MaxHeight, Origins) {
    var placement = function (component, posInfo, anchorInfo, origin) {
      var hotspot = anchorInfo.hotspot();
      var anchorBox = Origins.toBox(origin, hotspot.element());

      return Option.some(
        Anchoring({
          anchorBox: Fun.constant(anchorBox),
          bubble: Fun.constant(Bubble(0, 0)),
          // maxHeightFunction: Fun.constant(MaxHeight.available()),
          overrides: Fun.constant({ }),
          layouts: Fun.constant(Layout.all())
        })
      );
    };

    return [
      FieldSchema.strict('hotspot'),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);