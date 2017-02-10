define(
  'ephox.boulder.format.TypeTokens',

  [
    'ephox.scullion.ADT'
  ],
  
  function (Adt) {
    var typeAdt = Adt.generate([
      { setOf: [ 'validator', 'valueType' ] },
      { arrOf: [ 'valueType' ] },
      { objOf: [ 'fields' ] },
      { itemOf: [ 'validator' ] },
      { choiceOf: [ 'key', 'branches' ] }

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