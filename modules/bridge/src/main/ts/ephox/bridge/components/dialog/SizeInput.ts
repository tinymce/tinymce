import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface SizeInputApi extends FormComponentWithLabelApi {
  type: 'sizeinput';
  constrain?: boolean;
}

export interface SizeInput extends FormComponentWithLabel {
  type: 'sizeinput';
  constrain: boolean;
}

export const sizeInputFields = formComponentWithLabelFields.concat([
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
