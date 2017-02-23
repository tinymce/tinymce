define(
  'ephox.alloy.positioning.layout.Bounds',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    return Struct.immutable('x', 'y', 'width', 'height');
  }
);