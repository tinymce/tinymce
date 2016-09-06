define(
  'ephox.alloy.positioning.AnchorSchema',

  [
    'ephox.alloy.positioning.HotspotAnchor',
    'ephox.alloy.positioning.SubmenuAnchor',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (HotspotAnchor, SubmenuAnchor, ValueSchema, Fun) {
    return ValueSchema.choose(
      'anchor', {
        // range: rangeAnchorSchema,
        // image: imageAnchorSchema,
        hotspot: HotspotAnchor,
        submenu: SubmenuAnchor
      }
    );
  }
);