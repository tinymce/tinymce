define(
  'ephox.phoenix.api.data.GatherResult',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    return Struct.immutable('result', 'pruned');
  }
);
