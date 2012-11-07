define(
  'ephox.robin.data.PreviousWord',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('start', 'offset', 'text');
  }
);