define(
  'ephox.boulder.format.TypeTokens',

  [
    'ephox.katamari.api.Adt'
  ],
  
  function (Adt) {
    var typeAdt = Adt.generate([
      { setOf: [ 'validator', 'valueType' ] },
      { arrOf: [ 'valueType' ] },
      { objOf: [ 'fields' ] },
      { itemOf: [ 'validator' ] },
      { choiceOf: [ 'key', 'branches' ] },
      { thunk: [ 'description' ] }
    ]);

    var fieldAdt = Adt.generate([
      { field: [ 'name', 'presence', 'type' ] },
      { state: [ 'name' ] }
    ]);

    return {
      typeAdt: typeAdt,
      fieldAdt: fieldAdt
    };
  }
);