import { DslAdt } from '../core/ValueProcessor';

// NOTE: This provides cata functions for the ADTs in TypeTokens
var foldType = function (subject: DslAdt, onSet: () => any, onArr: () => any, onObj: () => any, onItem: () => any, onChoice: () => any, onThunk: () => any, onFunc: () => any): any {
  return subject.fold(onSet, onArr, onObj, onItem, onChoice, onThunk, onFunc);
};

var foldField = function (subject: DslAdt, onField: () => any, onState: () => any): any {
  return subject.fold(onField, onState);
};

export default <any> {
  foldType: foldType,
  foldField: foldField
};