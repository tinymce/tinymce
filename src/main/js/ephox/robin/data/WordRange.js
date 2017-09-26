define(
  'ephox.robin.data.WordRange',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    return Struct.immutable('startContainer', 'startOffset', 'endContainer', 'endOffset');
  }
);
