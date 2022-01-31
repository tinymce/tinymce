import { StructureSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface SizeInputSpec extends FormComponentWithLabelSpec {
  type: 'sizeinput';
  constrain?: boolean;
  enabled?: boolean;
}

export interface SizeInput extends FormComponentWithLabel {
  type: 'sizeinput';
  constrain: boolean;
  enabled: boolean;
}

const sizeInputFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedBoolean('constrain', true),
  ComponentSchema.enabled
]);

export const sizeInputSchema = StructureSchema.objOf(sizeInputFields);

export const sizeInputDataProcessor = StructureSchema.objOf([
  FieldSchema.requiredString('width'),
  FieldSchema.requiredString('height')
]);

export const createSizeInput = (spec: SizeInputSpec): Result<SizeInput, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<SizeInput>('sizeinput', sizeInputSchema, spec);
