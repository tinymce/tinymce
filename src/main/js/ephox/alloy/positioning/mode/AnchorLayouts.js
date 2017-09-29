define(
  'ephox.alloy.positioning.mode.AnchorLayouts',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.sugar.api.properties.Direction'
  ],

  function (FieldSchema, Direction) {
    var schema = function () {
      return FieldSchema.optionObjOf('layouts', [
        FieldSchema.strict('onLtr'),
        FieldSchema.strict('onRtl')
      ]);
    };

    var get = function (component, info, defaultLtr, defaultRtl) {
      var ltr = info.layouts().map(function (ls) {
        return ls.onLtr();
      }).getOr(defaultLtr);

      var rtl = info.layouts().map(function (ls) {
        return ls.onRtl();
      }).getOr(defaultRtl);

      return Direction.onDirection(ltr, rtl)(component.element());
    };

    return {
      schema: schema,
      get: get
    };
  }
);
