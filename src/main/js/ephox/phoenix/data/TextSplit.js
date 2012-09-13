define(
  'ephox.phoenix.data.TextSplit',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var bisect = Struct.immutable('before', 'after');
    var trisect = Struct.immutable('before', 'middle', 'after');

    return {
      bisect: bisect,
      trisect: trisect
    };
  }
);
