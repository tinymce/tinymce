define(
  'ephox.phoenix.data.TextSplit',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('before', 'after');
  }
);
