// NOTE: This provides cata functions for the ADTs in TypeTokens
var foldType = function (subject, onSet, onArr, onObj, onItem, onChoice) {
  return subject.fold(onSet, onArr, onObj, onItem, onChoice);
};

var foldField = function (subject, onField, onState) {
  return subject.fold(onField, onState);
};

export default <any> {
  foldType: foldType,
  foldField: foldField
};