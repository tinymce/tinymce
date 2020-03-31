import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface ColorPickerApi extends FormComponentWithLabelApi {
  type: 'colorpicker';
}

export interface ColorPicker extends FormComponentWithLabel {
  type: 'colorpicker';
}

const colorPickerFields = formComponentWithLabelFields;

export const colorPickerSchema = ValueSchema.objOf(colorPickerFields);

export const colorPickerDataProcessor = ValueSchema.string;

export const createColorPicker = (spec: ColorPickerApi): Result<ColorPicker, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<ColorPicker>('colorpicker', colorPickerSchema, spec);
