define(
  'ephox.robin.words.Zone',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutableBag([ 'elements', 'lang', 'words' ], [ ]);
  }
);