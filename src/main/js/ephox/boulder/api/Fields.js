define(
  'ephox.boulder.api.Fields',

  [
    'ephox.scullion.ADT'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { property: [ 'key', 'okey', 'presence', 'validation' ] },
      { obj: [ 'key', 'okey', 'presence', 'validation', 'fields' ] },
      { arr: [ 'key', 'okey', 'presence', 'validation', 'fields' ] },
      { state: [ 'okey', 'instantiator' ] },
      { snapshot: [ 'okey' ] }
    ]);

    return {
      property: adt.property,
      obj: adt.obj,
      arr: adt.arr,
      state: adt.state,
      snapshot: adt.snapshot
    };
  }
);