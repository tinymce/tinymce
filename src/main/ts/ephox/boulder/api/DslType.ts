import { EncodedAdt } from '../core/ValueProcessor';

// NOTE: This provides cata functions for the ADTs in TypeTokens
const foldType = function (subject: EncodedAdt, onSet: () => any, onArr: () => any, onObj: () => any, onItem: () => any, onChoice: () => any, onThunk: () => any, onFunc: () => any): any {
  return subject.fold(onSet, onArr, onObj, onItem, onChoice, onThunk, onFunc);
};

const foldField = function (subject: EncodedAdt, onField: () => any, onState: () => any): any {
  return subject.fold(onField, onState);
};

export default <any> {
  foldType,
  foldField
};