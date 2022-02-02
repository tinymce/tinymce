import { StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponentWithLabel, formComponentWithLabelFields, FormComponentWithLabelSpec } from './FormComponent';

export interface ColorInputSpec extends FormComponentWithLabelSpec {
  type: 'colorinput';
}

export interface ColorInput extends FormComponentWithLabel {
  type: 'colorinput';
}

const colorInputFields = formComponentWithLabelFields;

export const colorInputSchema = StructureSchema.objOf(colorInputFields);

export const colorInputDataProcessor = ValueType.string;

export const createColorInput = (spec: ColorInputSpec): Result<ColorInput, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ColorInput>('colorinput', colorInputSchema, spec);
