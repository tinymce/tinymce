import { Optional } from '@ephox/katamari';
import * as FieldPresence from '../api/FieldPresence';
import { Processor } from './ValueProcessor';

interface FieldData {
  key: string;
  okey: string;
  presence: FieldPresence.FieldPresenceTypes;
  prop: Processor;
}

interface StateData {
  okey: string;
  instantiator: (obj: any) => Optional<unknown>;
}

interface ValuePresenceData<D, T> {
  discriminator: D;
  data: T;
}

export type FieldProcesserData = ValuePresenceData<'field', FieldData>;
export type StateProcessorData = ValuePresenceData<'state', StateData>;

export type ValueProcessorTypes = FieldProcesserData | StateProcessorData;

// These are the types for the fold callbacks
export type FieldValueProcessor<T> = (key: string, okey: string, presence: FieldPresence.FieldPresenceTypes, prop: Processor) => T;
export type StateValueProcessor<T> = (okey: string, instantiator: (obj: any) => Optional<unknown>) => T;

const constructors = {
  field: (key: string, okey: string, presence: FieldPresence.FieldPresenceTypes, prop: Processor): FieldProcesserData => ({ discriminator: 'field', data: { key, okey, presence, prop }}),
  state: (okey: string, instantiator: (obj: any) => Optional<unknown>): StateProcessorData => ({ discriminator: 'state', data: { okey, instantiator }})
};

const fold = <T>(value: ValueProcessorTypes, ifField: FieldValueProcessor<T>, ifState: StateValueProcessor<T>): T => {
  switch (value.discriminator) {
    case 'field': {
      const data = value.data;
      return ifField(data.key, data.okey, data.presence, data.prop);
    }
    case 'state': return ifState(value.data.okey, value.data.instantiator);
  }
};

const field = constructors.field;
const state = constructors.state;

export {
  field,
  state,
  fold
};