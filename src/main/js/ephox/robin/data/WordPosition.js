define(
  'ephox.robin.data.WordPosition',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('start', 'offset', 'text');
  }
);