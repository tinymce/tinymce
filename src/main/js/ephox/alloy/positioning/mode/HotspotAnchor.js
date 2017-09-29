define(
  'ephox.alloy.positioning.mode.HotspotAnchor',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.positioning.layout.Bubble',
    'ephox.alloy.positioning.layout.Layout',
    'ephox.alloy.positioning.layout.Origins',
    'ephox.alloy.positioning.mode.Anchoring',
    'ephox.alloy.positioning.mode.AnchorLayouts',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fields, Bubble, Layout, Origins, Anchoring, AnchorLayouts, FieldSchema, Fun, Option) {
    var placement = function (component, posInfo, anchorInfo, origin) {
      var hotspot = anchorInfo.hotspot();
      var anchorBox = Origins.toBox(origin, hotspot.element());

      var layouts = AnchorLayouts.get(component, anchorInfo, Layout.all(), Layout.allRtl());

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
      AnchorLayouts.schema(),
      Fields.output('placement', placement)
    ];
  }
);