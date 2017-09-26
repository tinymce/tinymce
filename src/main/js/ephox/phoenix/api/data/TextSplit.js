define(
  'ephox.phoenix.api.data.TextSplit',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    return Struct.immutable('before', 'after');
  }
);
