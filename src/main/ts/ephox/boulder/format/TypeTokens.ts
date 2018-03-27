import { Adt } from '@ephox/katamari';
import { AdtInterface } from '../alien/AdtDefinition';
import { ValueValidator, Processor } from '../core/ValueProcessor';
import { FieldPresenceAdt } from '../api/FieldPresence';

export type SetOfTypeProcessor = (validator: ValueValidator, valueType: Processor) => any;
export type ArrOfTypeProcessor = (prop: Processor) => any;
export type ObjOfTypeProcessor = (fields: FieldProcessorAdt[]) => any;
export type ItemOfTypeProcessor = (validator: ValueValidator) => any;
export type ChoiceOfTypeProcessor = (key: string, branches: { [key: string]: FieldProcessorAdt[]; }) => any;
export type ThunkTypeProcessor = (description: string) => any;
export type FuncTypeProcessor = (args: string[], schema: Processor) => any;

export interface TypeProcessorAdt extends AdtInterface {
  fold<T>(SetOfTypeProcessor, ArrOfTypeProcessor, ObjOfTypeProcessor, ItemOfTypeProcessor, ChoiceOfTypeProcessor, ThunkTypeProcessor, FuncTypeProcessor): T;
}

export type OnFieldFieldProcessor = (name: string, presence: FieldPresenceAdt, type: Processor) => any;
export type StateFieldProcessor = (name: string) => any;

export interface FieldProcessorAdt extends AdtInterface {
  fold<T>(OnFieldFieldProcessor, StateFieldProcessor): T;
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