define(
  'ephox.phoenix.data.Focus',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    return Struct.immutable('left', 'element', 'right');
  }
);
