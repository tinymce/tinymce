import { FieldSchema, StructureSchema } from '@ephox/boulder';

import { formComponentFields, FormComponentWithLabel, FormComponentWithLabelSpec } from './FormComponent';

export interface SliderSpec extends FormComponentWithLabelSpec {
  type: 'slider';
  min?: number;
  max?: number;
}

export interface Slider extends FormComponentWithLabel {
  type: 'slider';
  min: number;
  max: number;
}

export const sliderSchema = StructureSchema.objOf(
  formComponentFields.concat([
    FieldSchema.requiredString('label'),
    FieldSchema.defaultedNumber('min', 0),
    FieldSchema.defaultedNumber('max', 0),
  ])
);
