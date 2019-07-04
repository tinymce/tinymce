import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Option, Result } from '@ephox/katamari';
import { FormComponentWithLabelApi, FormComponentWithLabel, formComponentWithLabelFields } from './FormComponent';

export interface InputApi extends FormComponentWithLabelApi {
  type: 'input';
  placeholder?: string;
}

export interface Input extends FormComponentWithLabel {
  type: 'input';
  placeholder: Option<string>;
}

export const inputFields = formComponentWithLabelFields.concat([
  FieldSchema.optionString('placeholder')
]);

export const inputSchema = ValueSchema.objOf(inputFields);

export const inputDataProcessor = ValueSchema.string;

export const createInput = (spec: InputApi): Result<Input, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Input>('input', inputSchema, spec);
};
