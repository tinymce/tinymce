import { StructureSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface SizeInputSpec extends FormComponentWithLabelSpec {
  type: 'sizeinput';
  constrain?: boolean;
  enabled?: boolean;
  context?: string;
}

export interface SizeInput extends FormComponentWithLabel {
  type: 'sizeinput';
  constrain: boolean;
  enabled: boolean;
  context: string;
}

const sizeInputFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedBoolean('constrain', true),
  ComponentSchema.enabled,
  FieldSchema.defaultedString('context', 'mode:design')
]);

export const sizeInputSchema = StructureSchema.objOf(sizeInputFields);

export const sizeInputDataProcessor = StructureSchema.objOf([
  FieldSchema.requiredString('width'),
  FieldSchema.requiredString('height')
]);

export const createSizeInput = (spec: SizeInputSpec): Result<SizeInput, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<SizeInput>('sizeinput', sizeInputSchema, spec);
