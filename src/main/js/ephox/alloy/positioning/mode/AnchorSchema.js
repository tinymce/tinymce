define(
  'ephox.alloy.positioning.mode.AnchorSchema',

  [
    'ephox.alloy.positioning.mode.HotspotAnchor',
    'ephox.alloy.positioning.mode.MakeshiftAnchor',
    'ephox.alloy.positioning.mode.SelectionAnchor',
    'ephox.alloy.positioning.mode.SubmenuAnchor',
    'ephox.boulder.api.ValueSchema'
  ],

  function (HotspotAnchor, MakeshiftAnchor, SelectionAnchor, SubmenuAnchor, ValueSchema) {
    return ValueSchema.choose(
      'anchor', {
        selection: SelectionAnchor,
        hotspot: HotspotAnchor,
        submenu: SubmenuAnchor,
        makeshift: MakeshiftAnchor
      }
    );
  }
);