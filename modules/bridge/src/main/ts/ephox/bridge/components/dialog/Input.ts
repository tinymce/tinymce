import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Option, Result } from '@ephox/katamari';
import { FormComponentWithLabelApi, FormComponentWithLabel, formComponentWithLabelFields } from './FormComponent';

export interface InputApi extends FormComponentWithLabelApi {
  type: 'input';
  inputMode?: string;
  placeholder?: string;
  maximized?: boolean;
  disabled?: boolean;
}

export interface Input extends FormComponentWithLabel {
  type: 'input';
  inputMode: Option<string>;
  placeholder: Option<string>;
  maximized: boolean;
  disabled: boolean;
}

const inputFields = formComponentWithLabelFields.concat([
  FieldSchema.optionString('inputMode'),
  FieldSchema.optionString('placeholder'),
  FieldSchema.defaultedBoolean('maximized', false),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const inputSchema = ValueSchema.objOf(inputFields);

export const inputDataProcessor = ValueSchema.string;

export const createInput = (spec: InputApi): Result<Input, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<Input>('input', inputSchema, spec);
