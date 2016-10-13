define(
  'ephox.alloy.positioning.HotspotAnchor',

  [
    'ephox.alloy.positioning.Anchoring',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.Layout',
    'ephox.repartee.api.Origins',
    'ephox.sugar.api.Direction'
  ],

  function (Anchoring, FieldSchema, Fun, Option, Bubble, Layout, Origins, Direction) {
    var placement = function (component, posInfo, anchorInfo, origin) {
      var hotspot = anchorInfo.hotspot();
      var anchorBox = Origins.toBox(origin, hotspot.element());

      var layouts = Direction.onDirection(Layout.all(), Layout.allRtl())(component.element());

      return Option.some(
        Anchoring({
          anchorBox: Fun.constant(anchorBox),
          bubble: Fun.constant(Bubble(0, 0)),
          // maxHeightFunction: Fun.constant(MaxHeight.available()),
          overrides: Fun.constant({ }),
          layouts: Fun.constant(layouts)
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