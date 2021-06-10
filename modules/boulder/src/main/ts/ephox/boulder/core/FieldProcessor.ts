import * as FieldPresence from '../api/FieldPresence';
import { StructureProcessor } from './StructureProcessor';

export const enum ValueType {
  Field = 'field',
  CustomField = 'custom'
}

export interface FieldProcessorData {
  readonly tag: ValueType.Field;
  readonly key: string;
  readonly newKey: string;
  readonly presence: FieldPresence.FieldPresence;
  readonly prop: StructureProcessor;
}

export interface CustomFieldProcessorData {
  readonly tag: ValueType.CustomField;
  readonly newKey: string;
  readonly instantiator: (obj: any) => unknown;
}

export type FieldProcessor = FieldProcessorData | CustomFieldProcessorData;

// These are the types for the fold callbacks
export type FieldValueProcessor<T> = (key: string, newKey: string, presence: FieldPresence.FieldPresence, prop: StructureProcessor) => T;
export type CustomFieldValueProcessor<T> = (newKey: string, instantiator: (obj: any) => any) => T;

const field = (key: string, newKey: string, presence: FieldPresence.FieldPresence, prop: StructureProcessor): FieldProcessorData => ({ tag: ValueType.Field, key, newKey, presence, prop });
const customField = (newKey: string, instantiator: (obj: any) => any): CustomFieldProcessorData => ({ tag: ValueType.CustomField, newKey, instantiator });

const fold = <T>(value: FieldProcessor, ifField: FieldValueProcessor<T>, ifCustom: CustomFieldValueProcessor<T>): T => {
  switch (value.tag) {
    case ValueType.Field:
      return ifField(value.key, value.newKey, value.presence, value.prop);
    case ValueType.CustomField:
      return ifCustom(value.newKey, value.instantiator);
  }
};

export {
  field,
  customField,
  fold
};
