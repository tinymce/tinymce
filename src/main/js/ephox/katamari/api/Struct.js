define(
  'ephox.katamari.api.Struct',

  [
    'ephox.katamari.data.Immutable',
    'ephox.katamari.data.Immutable2',
    'ephox.katamari.data.MixedBag'
  ],

  function (Immutable, Immutable2, MixedBag) {
    return {
      immutable: Immutable,
      immutable2: Immutable2,
      immutableBag: MixedBag
    };
  }
);
