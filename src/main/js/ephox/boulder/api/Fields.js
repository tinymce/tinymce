define(
  'ephox.boulder.api.Fields',

  [
    'ephox.peanut.Fun',
    'ephox.scullion.ADT'
  ],

  function (Fun, Adt) {
    var adt = Adt.generate([
      { prop: [ 'key', 'okey', 'presence', 'validation' ] },
      // Probably really only need validation for prop, not obj and arr.
      { obj: [ 'key', 'okey', 'presence', 'fields' ] },
      { arr: [ 'key', 'okey', 'presence', 'fields' ] },
      { state: [ 'okey', 'instantiator' ] }
    ]);

    var output = function (okey, value) {
      return adt.state(okey, Fun.constant(value));
    };

    var snapshot = function (okey) {
      return adt.state(okey, Fun.identity);
    };

    return {
      prop: adt.prop,
      obj: adt.obj,
      arr: adt.arr,
      state: adt.state,
      
      output: output,
      snapshot: snapshot,
    };
  }
);