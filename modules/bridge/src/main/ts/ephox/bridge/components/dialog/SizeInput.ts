import { StructureSchema, FieldSchema } from '@ephox/boulder';
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

export const sizeInputSchema = StructureSchema.objOf(sizeInputFields);

export const sizeInputDataProcessor = StructureSchema.objOf([
  FieldSchema.requiredString('width'),
  FieldSchema.requiredString('height')
]);

export const createSizeInput = (spec: SizeInputSpec): Result<SizeInput, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<SizeInput>('sizeinput', sizeInputSchema, spec);
