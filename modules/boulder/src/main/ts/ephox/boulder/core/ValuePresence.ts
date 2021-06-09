import * as FieldPresence from '../api/FieldPresence';
import { Processor } from './ValueProcessor';

export const enum ValueType {
  Field = 'field',
  State = 'state'
}

export interface FieldProcessorData {
  readonly tag: ValueType.Field;
  readonly key: string;
  readonly newKey: string;
  readonly presence: FieldPresence.FieldPresence;
  readonly prop: Processor;
}

export interface StateProcessorData {
  readonly tag: ValueType.State;
  readonly newKey: string;
  readonly instantiator: (obj: any) => unknown;
}

export type ValueProcessor = FieldProcessorData | StateProcessorData;

// These are the types for the fold callbacks
export type FieldValueProcessor<T> = (key: string, newKey: string, presence: FieldPresence.FieldPresence, prop: Processor) => T;
export type StateValueProcessor<T> = (newKey: string, instantiator: (obj: any) => any) => T;

const field = (key: string, newKey: string, presence: FieldPresence.FieldPresence, prop: Processor): FieldProcessorData => ({ tag: ValueType.Field, key, newKey, presence, prop });
const state = (newKey: string, instantiator: (obj: any) => any): StateProcessorData => ({ tag: ValueType.State, newKey, instantiator });

const fold = <T>(value: ValueProcessor, ifField: FieldValueProcessor<T>, ifState: StateValueProcessor<T>): T => {
  switch (value.tag) {
    case ValueType.Field:
      return ifField(value.key, value.newKey, value.presence, value.prop);
    case ValueType.State:
      return ifState(value.newKey, value.instantiator);
  }
};

export {
  field,
  state,
  fold
};
