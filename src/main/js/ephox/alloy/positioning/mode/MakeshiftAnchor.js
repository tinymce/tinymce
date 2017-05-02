define(
  'ephox.alloy.positioning.mode.MakeshiftAnchor',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.positioning.layout.Bounds',
    'ephox.alloy.positioning.layout.Bubble',
    'ephox.alloy.positioning.layout.Layout',
    'ephox.alloy.positioning.mode.Anchoring',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Direction'
  ],

  function (Fields, Bounds, Bubble, Layout, Anchoring, FieldSchema, Fun, Option, Direction) {
    var placement = function (component, posInfo, anchorInfo, origin) {
      var anchorBox = Bounds(anchorInfo.x(), anchorInfo.y(), anchorInfo.width(), anchorInfo.height());

      // var layouts = Direction.onDirection(Layout.all(), Layout.allRtl())(component.element());
      var layouts = anchorInfo.layouts().getOrThunk(function () {
        return Direction.onDirection(Layout.all(), Layout.allRtl())(component.element());
      });

      return Option.some(
        Anchoring({
          anchorBox: Fun.constant(anchorBox),
          bubble: anchorInfo.bubble,
          // maxHeightFunction: Fun.constant(MaxHeight.available()),
          overrides: Fun.constant({ }),
          layouts: Fun.constant(layouts),
          placer: Option.none
        })
      );
    };

    return [
      FieldSchema.strict('x'),
      FieldSchema.strict('y'),
      FieldSchema.defaulted('height', 0),
      FieldSchema.defaulted('width', 0),
      FieldSchema.defaulted('bubble', Bubble(0, 0)),
      FieldSchema.option('layouts'),
      Fields.output('placement', placement)
    ];
  }
);