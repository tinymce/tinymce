import { EncodedAdt, Processor, ValueValidator, FieldProcessorAdt } from '../core/ValueProcessor';
import { Result } from '@ephox/katamari';

// NOTE: This provides cata functions for the ADTs in TypeTokens
// This Typing is based on whats in TreeTest.ts, it may not be 100% correct, update as necessary.

import { ProcessorType } from '../format/TypeTokens';

const foldType = function <T> (subject: EncodedAdt,
                               onSet: (validator: ValueValidator, valueType: Processor) => T,
                               onArr: (prop: Processor) => T,
                               onObj: (fields: EncodedAdt) => T,
                               onItem: (validator: ValueValidator) => T,
                               onChoice: (key: string, branches: { [key: string]: FieldProcessorAdt[]; }) => T,
                               onThunk: (description: string) => T,
                               onFunc: (args: string[], schema: Processor) => T
                          ): T {
  return subject.fold(onSet, onArr, onObj, onItem, onChoice, onThunk, onFunc);
};

const foldField = function <T> (subject: EncodedAdt, onField: () => T, onState: () => T): T {
  return subject.fold(onField, onState);
};

export {
  foldType,
  foldField,

  EncodedAdt,
  Processor
};