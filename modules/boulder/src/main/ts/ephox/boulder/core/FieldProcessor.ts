import { FieldPresence } from '../api/FieldPresence';
import { StructureProcessor } from './StructureProcessor';

export const enum FieldTag {
  Field = 'field',
  CustomField = 'custom'
}

export interface Field {
  readonly tag: FieldTag.Field;
  readonly key: string;
  readonly newKey: string;
  readonly presence: FieldPresence;
  readonly prop: StructureProcessor;
}

export interface CustomField {
  readonly tag: FieldTag.CustomField;
  readonly newKey: string;
  readonly instantiator: (obj: any) => unknown;
}

export type FieldProcessor = Field | CustomField;

// These are the types for the fold callbacks
export type FieldValueProcessor<T> = (key: string, newKey: string, presence: FieldPresence, prop: StructureProcessor) => T;
export type CustomFieldValueProcessor<T> = (newKey: string, instantiator: (obj: any) => any) => T;

const field = (key: string, newKey: string, presence: FieldPresence, prop: StructureProcessor): Field => ({ tag: FieldTag.Field, key, newKey, presence, prop });
const customField = (newKey: string, instantiator: (obj: any) => any): CustomField => ({ tag: FieldTag.CustomField, newKey, instantiator });

const fold = <T>(value: FieldProcessor, ifField: FieldValueProcessor<T>, ifCustom: CustomFieldValueProcessor<T>): T => {
  switch (value.tag) {
    case FieldTag.Field:
      return ifField(value.key, value.newKey, value.presence, value.prop);
    case FieldTag.CustomField:
      return ifCustom(value.newKey, value.instantiator);
  }
};

export {
  field,
  customField,
  fold
};
