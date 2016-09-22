define(
  'ephox.robin.words.TextInfo',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutableBag('text', 'item');
  }
);