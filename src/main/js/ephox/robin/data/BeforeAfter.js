define(
  'ephox.robin.data.BeforeAfter',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('before', 'after');
  }
);
