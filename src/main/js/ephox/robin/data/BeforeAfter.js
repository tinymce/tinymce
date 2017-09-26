define(
  'ephox.robin.data.BeforeAfter',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    return Struct.immutable('before', 'after');
  }
);
