import * as FieldPresence from '../api/FieldPresence';
import { Processor } from './ValueProcessor';

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

interface ValuePresenceData<D, T> {
  readonly discriminator: D;
  readonly data: T;
}

export type FieldProcesserData = ValuePresenceData<'field', FieldData>;
export type StateProcessorData = ValuePresenceData<'state', StateData>;

export type ValueProcessorTypes = FieldProcesserData | StateProcessorData;

// These are the types for the fold callbacks
export type FieldValueProcessor<T> = (key: string, newKey: string, presence: FieldPresence.FieldPresenceTypes, prop: Processor) => T;
export type StateValueProcessor<T> = (newKey: string, instantiator: (obj: any) => any) => T;

const field = (key: string, newKey: string, presence: FieldPresence.FieldPresenceTypes, prop: Processor): FieldProcesserData => ({ discriminator: 'field', data: { key, newKey, presence, prop }});
const state = (newKey: string, instantiator: (obj: any) => any): StateProcessorData => ({ discriminator: 'state', data: { newKey, instantiator }});

const fold = <T>(value: ValueProcessorTypes, ifField: FieldValueProcessor<T>, ifState: StateValueProcessor<T>): T => {
  switch (value.discriminator) {
    case 'field': {
      const data = value.data;
      return ifField(data.key, data.newKey, data.presence, data.prop);
    }
    case 'state': return ifState(value.data.newKey, value.data.instantiator);
  }
};

export {
  field,
  state,
  fold
};
