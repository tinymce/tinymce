import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface ColorPickerSpec extends FormComponentWithLabelSpec {
  type: 'colorpicker';
}

export interface ColorPicker extends FormComponentWithLabel {
  type: 'colorpicker';
}

const colorPickerFields = formComponentWithLabelFields;

export const colorPickerSchema = ValueSchema.objOf(colorPickerFields);

export const colorPickerDataProcessor = ValueSchema.string;

export const createColorPicker = (spec: ColorPickerSpec): Result<ColorPicker, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ColorPicker>('colorpicker', colorPickerSchema, spec);
