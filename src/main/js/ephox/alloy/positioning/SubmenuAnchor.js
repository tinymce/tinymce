define(
  'ephox.alloy.positioning.SubmenuAnchor',

  [
    'ephox.alloy.positioning.Anchoring',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.LinkedLayout',
    'ephox.repartee.api.MaxHeight',
    'ephox.repartee.api.Origins',
    'ephox.sugar.api.Direction'
  ],

  function (Anchoring, FieldPresence, FieldSchema, ValueSchema, Fun, Option, Bubble, LinkedLayout, MaxHeight, Origins, Direction) {
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
      FieldSchema.field(
        'layouts',
        'layouts',
        FieldPresence.asOption(),
        ValueSchema.objOf([
          FieldSchema.strict('onLtr'),
          FieldSchema.strict('onRtl')
        ])
      ),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);