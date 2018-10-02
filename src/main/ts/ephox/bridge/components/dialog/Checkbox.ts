import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Result } from '@ephox/katamari';

export interface CheckboxApi {
  name: string;
  type: 'checkbox';
  label: string;
}

export interface Checkbox {
  name: string;
  type: 'checkbox';
  label: string;
}

export const checkboxFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('name'),
  FieldSchema.strictString('label')
];

export const checkboxSchema = ValueSchema.objOf(checkboxFields);

const validOptions = ['checked', 'unchecked', 'indeterminate'];
export const checkboxDataProcessor = ValueSchema.valueOf((value: string) => {
  if (Arr.contains(validOptions, value)) {
    return Result.value(value);
  } else {
    return Result.error('Checkbox data: can only be a string of either "' +
      validOptions.join('" | "') + '" ');
  }
});

export const createCheckbox = (spec: CheckboxApi): Result<Checkbox, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Checkbox>('checkbox', checkboxSchema, spec);
};
