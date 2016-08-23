define(
  'ephox.katamari.data.Immutable',

  [
    'ephox.katamari.data.Immutable2'
  ],

  function (Immutable2) {
    return function (/* fields */) {
      return Immutable2.product(arguments).nu;
    };
  }
);
