define(
  'ephox.alloy.positioning.SubmenuAnchor',

  [
    'ephox.alloy.positioning.Anchoring',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.LinkedLayout',
    'ephox.repartee.api.MaxHeight',
    'ephox.repartee.api.Origins',
    'ephox.sugar.api.Direction'
  ],

  function (Anchoring, FieldSchema, Fun, Option, Bubble, LinkedLayout, MaxHeight, Origins, Direction) {
    var placement = function (component, posInfo, submenuInfo, origin) {
      var anchorBox = Origins.toBox(origin, submenuInfo.item().element());

      var layouts = Direction.onDirection(LinkedLayout.all(), LinkedLayout.allRtl())(component.element());

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
      FieldSchema.strict('item'),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);