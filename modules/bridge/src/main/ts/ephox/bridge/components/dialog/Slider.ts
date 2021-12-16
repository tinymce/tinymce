import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';

import * as ComponentSchema from '../../core/ComponentSchema';
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

const sliderFields = formComponentFields.concat([
  ComponentSchema.label,
  FieldSchema.defaultedNumber('min', 0),
  FieldSchema.defaultedNumber('max', 0),
]);

export const sliderSchema = StructureSchema.objOf(sliderFields);

export const sliderInputDataProcessor = ValueType.number;
