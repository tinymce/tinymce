import { FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export interface CheckboxSpec {
  name: string;
  type: 'checkbox';
  label: string;
  disabled?: boolean;
}

export interface Checkbox {
  name: string;
  type: 'checkbox';
  label: string;
  disabled: boolean;
}

const checkboxFields = [
  FieldSchema.requiredString('type'),
  FieldSchema.requiredString('name'),
  FieldSchema.requiredString('label'),
  FieldSchema.defaultedBoolean('disabled', false)
];

export const checkboxSchema = ValueSchema.objOf(checkboxFields);

export const checkboxDataProcessor = ValueType.boolean;

export const createCheckbox = (spec: CheckboxSpec): Result<Checkbox, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Checkbox>('checkbox', checkboxSchema, spec);
