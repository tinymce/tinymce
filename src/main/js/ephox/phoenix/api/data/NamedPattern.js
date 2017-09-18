define(
  'ephox.phoenix.api.data.NamedPattern',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    return Struct.immutable('word', 'pattern');
  }
);