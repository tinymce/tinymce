define(
  'ephox.robin.data.LineInfo',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('zone', 'words');
  }
);
