import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface SizeInputApi extends FormComponentApi {
  type: 'sizeinput';
  constrain?: boolean;
}

export interface SizeInput extends FormComponent {
  type: 'sizeinput';
  constrain: boolean;
}

export const sizeInputFields = formComponentFields.concat([
  FieldSchema.defaultedBoolean('constrain', true)
]);

export const sizeInputSchema = ValueSchema.objOf(sizeInputFields);

export const sizeInputDataProcessor = ValueSchema.objOf([
  FieldSchema.strictString('width'),
  FieldSchema.strictString('height')
]);

export const createSizeInput = (spec: SizeInputApi): Result<SizeInput, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<SizeInput>('sizeinput', sizeInputSchema, spec);
};
