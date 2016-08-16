test(
  'Struct.immutable',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    var Thing = Struct.immutable('fred', 'barney');
    var thing = Thing('hello', 1);
    assert.eq('hello', thing.fred());
    assert.eq(1, thing.barney());
  }
);