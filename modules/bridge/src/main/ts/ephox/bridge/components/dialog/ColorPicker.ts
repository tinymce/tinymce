import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponent, FormComponentApi, formComponentFields } from './FormComponent';

export interface ColorPickerApi extends FormComponentApi {
  type: 'colorpicker';
}

export interface ColorPicker extends FormComponent {
  type: 'colorpicker';
}

export const colorPickerFields = formComponentFields;

export const colorPickerSchema = ValueSchema.objOf(colorPickerFields);

export const colorPickerDataProcessor = ValueSchema.string;

export const createColorPicker = (spec: ColorPickerApi): Result<ColorPicker, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<ColorPicker>('colorpicker', colorPickerSchema, spec);
};
