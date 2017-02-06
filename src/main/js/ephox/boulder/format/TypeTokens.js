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

    var foldType = function (subject, onSet, onArr, onObj, onItem, onChoice) {
      return subject.fold(onSet, onArr, onObj, onItem, onChoice);
    };

    var foldField = function (subject, onField, onState) {
      return subject.fold(onField, onState);
    };
    
    return {
      typeAdt: typeAdt,
      fieldAdt: fieldAdt,
      foldType: foldType,
      foldField: foldField
    };
  }
);