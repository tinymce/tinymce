import * as FieldPresence from '../api/FieldPresence';
import { Processor } from './ValueProcessor';

export const enum ValueType {
  Field = 'field',
  State = 'state'
}

interface FieldData {
  readonly key: string;
  readonly newKey: string;
  readonly presence: FieldPresence.FieldPresenceTypes;
  readonly prop: Processor;
}

interface StateData {
  readonly newKey: string;
  readonly instantiator: (obj: any) => unknown;
}

interface ValuePresenceData<D extends ValueType, T> {
  readonly tag: D;
  readonly data: T;
}

export type FieldProcessorData = ValuePresenceData<ValueType.Field, FieldData>;
export type StateProcessorData = ValuePresenceData<ValueType.State, StateData>;

export type ValueProcessorTypes = FieldProcessorData | StateProcessorData;

// These are the types for the fold callbacks
export type FieldValueProcessor<T> = (key: string, newKey: string, presence: FieldPresence.FieldPresenceTypes, prop: Processor) => T;
export type StateValueProcessor<T> = (newKey: string, instantiator: (obj: any) => any) => T;

const field = (key: string, newKey: string, presence: FieldPresence.FieldPresenceTypes, prop: Processor): FieldProcessorData => ({ tag: ValueType.Field, data: { key, newKey, presence, prop }});
const state = (newKey: string, instantiator: (obj: any) => any): StateProcessorData => ({ tag: ValueType.State, data: { newKey, instantiator }});

const fold = <T>(value: ValueProcessorTypes, ifField: FieldValueProcessor<T>, ifState: StateValueProcessor<T>): T => {
  switch (value.tag) {
    case ValueType.Field: {
      const data = value.data;
      return ifField(data.key, data.newKey, data.presence, data.prop);
    }
    case ValueType.State:
      return ifState(value.data.newKey, value.data.instantiator);
  }
};

export {
  field,
  state,
  fold
};
