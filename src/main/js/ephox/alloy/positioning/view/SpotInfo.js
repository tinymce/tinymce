define(
  'ephox.alloy.positioning.view.SpotInfo',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    return Struct.immutable('x', 'y', 'bubble', 'direction', 'anchors', 'label');
  }
);
