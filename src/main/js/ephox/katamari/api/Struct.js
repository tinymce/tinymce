define(
  'ephox.katamari.api.Struct',

  [
    'ephox.katamari.data.Immutable',
    'ephox.katamari.data.MixedBag'
  ],

  function (Immutable, MixedBag) {
    return {
      immutable: Immutable,
      immutableBag: MixedBag
    };
  }
);
