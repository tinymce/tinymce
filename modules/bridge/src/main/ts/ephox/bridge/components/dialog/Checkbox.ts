import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
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

export const checkboxSchema = StructureSchema.objOf(checkboxFields);

export const checkboxDataProcessor = ValueType.boolean;

export const createCheckbox = (spec: CheckboxSpec): Result<Checkbox, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Checkbox>('checkbox', checkboxSchema, spec);
