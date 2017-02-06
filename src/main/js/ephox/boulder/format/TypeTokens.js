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
      { itemOf: [ 'validator' ] }
    ]);

    var fieldAdt = Adt.generate([
      { field: [ 'type', 'presence' ] },
      { state: [ ] }
    ]);

    var foldType = function (subject, onSet, onArr, onObj) {
      return subject.fold(onSet, onArr, onObj);
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