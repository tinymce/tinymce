define(
  'ephox.robin.data.WordScope',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    return Struct.immutable('word', 'left', 'right');
  }
);
