import { EncodedAdt } from '../core/ValueProcessor';
import { Result } from '@ephox/katamari';

// NOTE: This provides cata functions for the ADTs in TypeTokens
// This Typing is based on whats in TreeTest.ts, it may not be 100% correct, update as necessary.
const foldType = function (subject: EncodedAdt,
                           onSet: (validator: any, valueType: any) => any,
                           onArr: (a: any) => any,
                           onObj: (fields: any) => any,
                           onItem: (validator: Result <any, any>) => any,
                           onChoice: (key: any, branches: any) => any,
                           onThunk: () => void,
                           onFunc: (a: any, b: any) => any
                          ): any {
  return subject.fold(onSet, onArr, onObj, onItem, onChoice, onThunk, onFunc);
};

const foldField = function (subject: EncodedAdt, onField: () => any, onState: () => any): any {
  return subject.fold(onField, onState);
};

export const DslType = {
  foldType,
  foldField
};