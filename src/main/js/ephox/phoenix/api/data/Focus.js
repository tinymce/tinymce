define(
  'ephox.phoenix.api.data.Focus',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    return Struct.immutable('left', 'element', 'right');
  }
);
