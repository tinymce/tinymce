import { FieldSchema, StructureSchema } from '@ephox/boulder';

import { formComponentFields, FormComponent, FormComponentSpec } from './FormComponent';

export interface SliderSpec extends FormComponentSpec {
  type: 'slider';
  label: string;
  min?: number;
  max?: number;
}

export interface Slider extends FormComponent {
  type: 'slider';
  label: string;
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
