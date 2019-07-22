import { Adt } from '@ephox/katamari';
import { ValueValidator, Processor } from '../core/ValueProcessor';
import { FieldPresenceAdt } from '../api/FieldPresence';

export type SetOfTypeProcessor = (validator: ValueValidator, valueType: Processor) => any;
export type ArrOfTypeProcessor = (prop: Processor) => any;
export type ObjOfTypeProcessor = (fields: FieldProcessorAdt[]) => any;
export type ItemOfTypeProcessor = (validator: ValueValidator) => any;
export type ChoiceOfTypeProcessor = (key: string, branches: Record<string, Processor>) => any;
export type ThunkTypeProcessor = (description: string) => any;
export type FuncTypeProcessor = (args: string[], schema: Processor) => any;

export interface TypeProcessorAdt extends Adt {
  fold<T>(SetOfTypeProcessor, ArrOfTypeProcessor, ObjOfTypeProcessor, ItemOfTypeProcessor, ChoiceOfTypeProcessor: (key: string, branches: Record<string, Processor>) => T, ThunkTypeProcessor, FuncTypeProcessor): T;
}

export type OnFieldFieldProcessor = (name: string, presence: FieldPresenceAdt, type: Processor) => any;
export type StateFieldProcessor = (name: string) => any;

export interface FieldProcessorAdt extends Adt {
  fold<T>(OnFieldFieldProcessor, StateFieldProcessor): T;
}

const typeAdt: {
  setOf: (validator: ValueValidator, valueType: Processor) => TypeProcessorAdt;
  arrOf: (valueType: Processor) => TypeProcessorAdt;
  objOf: (fields: FieldProcessorAdt[]) => TypeProcessorAdt;
  itemOf: (validator: ValueValidator) => TypeProcessorAdt;
  choiceOf: (key: string, branches: Record<string, Processor>) => TypeProcessorAdt;
  thunk: (description: string) => TypeProcessorAdt;
  func: (args: string[], outputSchema: Processor) => TypeProcessorAdt;
} = Adt.generate([
  { setOf: [ 'validator', 'valueType' ] },
  { arrOf: [ 'valueType' ] },
  { objOf: [ 'fields' ] },
  { itemOf: [ 'validator' ] },
  { choiceOf: [ 'key', 'branches' ] },
  { thunk: [ 'description' ] },
  { func: [ 'args', 'outputSchema' ] }
]);

const fieldAdt: {
  field: (name, presence, type) => FieldProcessorAdt;
  state: (name) => FieldProcessorAdt;
} = Adt.generate([
  { field: [ 'name', 'presence', 'type' ] },
  { state: [ 'name' ] }
]);

export {
  typeAdt,
  fieldAdt
};