define(
  'ephox.phoenix.api.data.GatherResult',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('result', 'pruned');
  }
);
