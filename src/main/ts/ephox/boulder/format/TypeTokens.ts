import { Adt } from '@ephox/katamari';
import { AdtInterface } from '../alien/AdtDefinition';
import { Processor } from 'ephox/boulder/api/Main';
import { ValueValidator } from 'ephox/boulder/core/ValueProcessor';

export type SetOfTypeProcessor = (validator: ValueValidator, valueType: Processor) => any;
export type ArrOfTypeProcessor = (prop: Processor) => any;
export type ObjOfTypeProcessor = (fields: FieldProcessorAdt) => any;
export type ItemOfTypeProcessor = (validator: ValueValidator) => any;
export type ChoiceOfTypeProcessor = (key: string, branches: { [key: string]: FieldProcessorAdt[]; }) => any;
export type ThunkTypeProcessor = (description: string) => any;
export type FuncTypeProcessor = (args: string[], schema: Processor) => any;

export interface TypeProcessorAdt extends AdtInterface {
  fold: (SetOfTypeProcessor, ArrOfTypeProcessor, ObjOfTypeProcessor, ItemOfTypeProcessor, ChoiceOfTypeProcessor, ThunkTypeProcessor, FuncTypeProcessor) => any;
}

export interface FieldProcessorAdt extends AdtInterface {
  // TODO: extend the correct fold type
  // fold: <T>(...fn: Array<(...x: any[]) => T>) => T;
}

const typeAdt = Adt.generate([
  { setOf: [ 'validator', 'valueType' ] },
  { arrOf: [ 'valueType' ] },
  { objOf: [ 'fields' ] },
  { itemOf: [ 'validator' ] },
  { choiceOf: [ 'key', 'branches' ] },
  { thunk: [ 'description' ] },
  { func: [ 'args', 'outputSchema' ] }
]);

const fieldAdt = Adt.generate([
  { field: [ 'name', 'presence', 'type' ] },
  { state: [ 'name' ] }
]);

export {
  typeAdt,
  fieldAdt
};