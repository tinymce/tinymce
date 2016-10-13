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
    'ephox.repartee.api.Origins'
  ],

  function (Anchoring, FieldSchema, Fun, Option, Bubble, LinkedLayout, MaxHeight, Origins) {
    var placement = function (component, posInfo, submenuInfo, origin) {
      var anchorBox = Origins.toBox(origin, submenuInfo.item().element());

      return Option.some(
        Anchoring({
          anchorBox: Fun.constant(anchorBox),
          bubble: Fun.constant(Bubble(0, 0)),
          // maxHeightFunction: Fun.constant(MaxHeight.available()),
          overrides: Fun.constant({ }),
          layouts: Fun.constant(LinkedLayout)
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