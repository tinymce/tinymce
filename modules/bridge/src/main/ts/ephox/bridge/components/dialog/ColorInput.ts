import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface ColorInputApi extends FormComponentWithLabelApi {
  type: 'colorinput';
}

export interface ColorInput extends FormComponentWithLabel {
  type: 'colorinput';
}

export const colorInputFields = formComponentWithLabelFields;

export const colorInputSchema = ValueSchema.objOf(colorInputFields);

export const colorInputDataProcessor = ValueSchema.string;

export const createInputBox = (spec: ColorInputApi): Result<ColorInput, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<ColorInput>('colorinput', colorInputSchema, spec);
};
