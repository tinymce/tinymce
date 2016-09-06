define(
  'ephox.alloy.positioning.SubmenuAnchor',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.LinkedLayout',
    'ephox.repartee.api.MaxHeight',
    'ephox.repartee.api.Origins'
  ],

  function (FieldSchema, Fun, Bubble, LinkedLayout, MaxHeight, Origins) {
    var placement = function (component, posInfo, submenuInfo, origin) {
      var anchorBox = Origins.toBox(origin, submenuInfo.item().element());

      return {
        anchorBox: Fun.constant(anchorBox),
        bubble: Fun.constant(Bubble(0, 0)),
        maxHeightFunction: Fun.constant(MaxHeight.available()),
        layouts: Fun.constant(LinkedLayout)
      };
    };

    return [
      FieldSchema.strict('item'),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);