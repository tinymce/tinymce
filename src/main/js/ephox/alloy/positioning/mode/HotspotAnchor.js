define(
  'ephox.alloy.positioning.mode.HotspotAnchor',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.positioning.layout.Bubble',
    'ephox.alloy.positioning.layout.Layout',
    'ephox.alloy.positioning.layout.Origins',
    'ephox.alloy.positioning.mode.Anchoring',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Direction'
  ],

  function (Fields, Bubble, Layout, Origins, Anchoring, FieldSchema, Fun, Option, Direction) {
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
          layouts: Fun.constant(layouts),
          placer: Option.none
        })
      );
    };

    return [
      FieldSchema.strict('hotspot'),
      Fields.output('placement', placement)
    ];
  }
);