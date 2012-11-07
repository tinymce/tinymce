define(
  'ephox.robin.data.ContextGather',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('list', 'text', 'cursor');
  }
);
