define(
  'ephox.phoenix.gather.GatherResult',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('result', 'pruned');
  }
);
