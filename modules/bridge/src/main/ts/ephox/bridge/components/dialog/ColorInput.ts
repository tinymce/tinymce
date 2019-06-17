import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface ColorInputApi extends FormComponentApi {
  type: 'colorinput';
}

export interface ColorInput extends FormComponent {
  type: 'colorinput';
}

export const colorInputFields = formComponentFields;

export const colorInputSchema = ValueSchema.objOf(colorInputFields);

export const colorInputDataProcessor = ValueSchema.string;

export const createInputBox = (spec: ColorInputApi): Result<ColorInput, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<ColorInput>('colorinput', colorInputSchema, spec);
};
