import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentApi, FormComponent, formComponentFields } from './FormComponent';

export interface InputApi extends FormComponentApi {
  type: 'input';
}

export interface Input extends FormComponent {
  type: 'input';
}

export const inputFields = formComponentFields;

export const inputSchema = ValueSchema.objOf(inputFields);

export const inputDataProcessor = ValueSchema.string;

export const createInput = (spec: InputApi): Result<Input, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Input>('input', inputSchema, spec);
};
