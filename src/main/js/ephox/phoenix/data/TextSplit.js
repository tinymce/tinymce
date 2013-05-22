define(
  'ephox.phoenix.data.TextSplit',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var bisect = Struct.immutable('before', 'after');
    
    return {
      bisect: bisect
    };
  }
);
