define(
  'ephox.alloy.positioning.AnchorSchema',

  [
    'ephox.alloy.positioning.HotspotAnchor',
    'ephox.alloy.positioning.SelectionAnchor',
    'ephox.alloy.positioning.SubmenuAnchor',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (HotspotAnchor, SelectionAnchor, SubmenuAnchor, ValueSchema, Fun) {
    return ValueSchema.choose(
      'anchor', {
        // range: rangeAnchorSchema,
        // image: imageAnchorSchema,
        selection: SelectionAnchor,
        hotspot: HotspotAnchor,
        submenu: SubmenuAnchor
      }
    );
  }
);