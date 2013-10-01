define(
  'ephox.robin.data.WordRange',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('startContainer', 'startOffset', 'endContainer', 'endOffset');
  }
);
