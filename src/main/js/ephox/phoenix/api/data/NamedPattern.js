define(
  'ephox.phoenix.api.data.NamedPattern',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('word', 'pattern');
  }
);