define(
  'ephox.robin.data.WordScope',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('word', 'left', 'right');
  }
);
