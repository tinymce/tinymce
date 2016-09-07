define(
  'ephox.alloy.alien.Boxes',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var pointed = Struct.immutable('point', 'width', 'height');
    var rect = Struct.immutable('x', 'y', 'width', 'height');

    return {
      pointed: pointed,
      rect: rect
    };
  }
);