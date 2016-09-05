define(
  'ephox.alloy.positioning.AnchorSchema',

  [
    'ephox.alloy.positioning.HotspotAnchor',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (HotspotAnchor, ValueSchema, Fun) {
    return ValueSchema.choose(
      'anchor', {
        // range: rangeAnchorSchema,
        // image: imageAnchorSchema,
        hotspot: HotspotAnchor
        // submenu: submenuAnchorSchema
      }
    );
  }
);