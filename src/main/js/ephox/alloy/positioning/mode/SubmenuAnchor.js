define(
  'ephox.alloy.positioning.mode.SubmenuAnchor',

  [
    'ephox.alloy.positioning.mode.Anchoring',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.alloy.positioning.layout.Bubble',
    'ephox.alloy.positioning.layout.LinkedLayout',
    'ephox.alloy.positioning.layout.Origins',
    'ephox.sugar.api.properties.Direction'
  ],

  function (Anchoring, FieldSchema, Fun, Option, Bubble, LinkedLayout, Origins, Direction) {
    var placement = function (component, posInfo, submenuInfo, origin) {
      var anchorBox = Origins.toBox(origin, submenuInfo.item().element());

      var ltr = submenuInfo.layouts().map(function (ls) {
        return ls.onLtr();
      }).getOr(LinkedLayout.all());

      var rtl = submenuInfo.layouts().map(function (ls) {
        return ls.onRtl();
      }).getOr(LinkedLayout.allRtl());

      var layouts = Direction.onDirection(ltr, rtl)(component.element());

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
      FieldSchema.optionObjOf('layouts', [
        FieldSchema.strict('onLtr'),
        FieldSchema.strict('onRtl')
      ]),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);