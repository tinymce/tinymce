import { Processor, ValueValidator } from '../core/ValueProcessor';
import { TypeProcessorAdt, SetOfTypeProcessor, ArrOfTypeProcessor, ObjOfTypeProcessor, ItemOfTypeProcessor, ChoiceOfTypeProcessor, ThunkTypeProcessor, FuncTypeProcessor, FieldProcessorAdt } from '../format/TypeTokens';

// NOTE: This provides cata functions for the ADTs in TypeTokens
// This Typing is based on whats in TreeTest.ts, it may not be 100% correct, update as necessary.

const foldType = function <T> (subject: TypeProcessorAdt,
                               onSet: SetOfTypeProcessor,
                               onArr: ArrOfTypeProcessor,
                               onObj: ObjOfTypeProcessor,
                               onItem: ItemOfTypeProcessor,
                               onChoice: ChoiceOfTypeProcessor,
                               onThunk: ThunkTypeProcessor,
                               onFunc: FuncTypeProcessor
                          ): T {
  return subject.fold(onSet, onArr, onObj, onItem, onChoice, onThunk, onFunc);
};

const foldField = function <T> (subject: FieldProcessorAdt, onField: () => T, onState: () => T): T {
  return subject.fold(onField, onState);
};

export {
  foldType,
  foldField,

  FieldProcessorAdt,
  Processor
};