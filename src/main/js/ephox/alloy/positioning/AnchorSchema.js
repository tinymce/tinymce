define(
  'ephox.alloy.positioning.AnchorSchema',

  [
    'ephox.alloy.positioning.HotspotAnchor',
    'ephox.alloy.positioning.MakeshiftAnchor',
    'ephox.alloy.positioning.ModalAnchor',
    'ephox.alloy.positioning.SelectionAnchor',
    'ephox.alloy.positioning.SubmenuAnchor',
    'ephox.boulder.api.ValueSchema'
  ],

  function (HotspotAnchor, MakeshiftAnchor, ModalAnchor, SelectionAnchor, SubmenuAnchor, ValueSchema) {
    return ValueSchema.choose(
      'anchor', {
        selection: SelectionAnchor,
        hotspot: HotspotAnchor,
        submenu: SubmenuAnchor,
        modal: ModalAnchor,
        makeshift: MakeshiftAnchor
      }
    );
  }
);