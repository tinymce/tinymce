import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponentWithLabel, formComponentWithLabelFields, FormComponentWithLabelSpec } from './FormComponent';

export interface ColorInputSpec extends FormComponentWithLabelSpec {
  type: 'colorinput';
  storageKey?: string;
  context?: string;
}

export interface ColorInput extends FormComponentWithLabel {
  type: 'colorinput';
  storageKey: string;
  context: string;
}

const colorInputFields = formComponentWithLabelFields.concat([
  FieldSchema.defaultedString('storageKey', 'default'),
  FieldSchema.defaultedString('context', 'mode:design'),
]);

export const colorInputSchema = StructureSchema.objOf(colorInputFields);

export const colorInputDataProcessor = ValueType.string;

export const createColorInput = (spec: ColorInputSpec): Result<ColorInput, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ColorInput>('colorinput', colorInputSchema, spec);
