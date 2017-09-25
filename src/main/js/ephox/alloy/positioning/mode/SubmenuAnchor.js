define(
  'ephox.alloy.positioning.mode.SubmenuAnchor',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.positioning.layout.Bubble',
    'ephox.alloy.positioning.layout.LinkedLayout',
    'ephox.alloy.positioning.layout.Origins',
    'ephox.alloy.positioning.mode.Anchoring',
    'ephox.alloy.positioning.mode.AnchorLayouts',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fields, Bubble, LinkedLayout, Origins, Anchoring, AnchorLayouts, FieldSchema, Fun, Option) {
    var placement = function (component, posInfo, submenuInfo, origin) {
      var anchorBox = Origins.toBox(origin, submenuInfo.item().element());

      var layouts = AnchorLayouts.get(component, submenuInfo, LinkedLayout.all(), LinkedLayout.allRtl());

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
      FieldSchema.strict('item'),
      AnchorLayouts.schema(),
      Fields.output('placement', placement)
    ];
  }
);