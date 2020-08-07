import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface SizeInputSpec extends FormComponentWithLabelSpec {
  type: 'sizeinput';
  constrain?: boolean;
  disabled?: boolean;
}

export interface SizeInput extends FormComponentWithLabel {
  type: 'sizeinput';
  constrain: boolean;
  disabled: boolean;
}

const sizeInputFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedBoolean('constrain', true),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const sizeInputSchema = ValueSchema.objOf(sizeInputFields);

export const sizeInputDataProcessor = ValueSchema.objOf([
  FieldSchema.strictString('width'),
  FieldSchema.strictString('height')
]);

export const createSizeInput = (spec: SizeInputSpec): Result<SizeInput, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<SizeInput>('sizeinput', sizeInputSchema, spec);
