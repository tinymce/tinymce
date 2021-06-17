import { FieldProcessor, FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { FormComponentWithLabel, formComponentWithLabelFields, FormComponentWithLabelSpec } from './FormComponent';

export interface SelectBoxItemSpec {
  text: string;
  value: string;
}

export interface SelectBoxSpec extends FormComponentWithLabelSpec {
  type: 'selectbox';
  items: SelectBoxItemSpec[];
  size?: number;
  disabled?: boolean;
}

export interface SelectBoxItem {
  text: string;
  value: string;
}

export interface SelectBox extends FormComponentWithLabel {
  type: 'selectbox';
  items: SelectBoxItem[];
  size: number;
  disabled: boolean;
}

const selectBoxFields: FieldProcessor[] = formComponentWithLabelFields.concat([
  FieldSchema.requiredArrayOfObj('items', [
    FieldSchema.requiredString('text'),
    FieldSchema.requiredString('value')
  ]),
  FieldSchema.defaultedNumber('size', 1),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const selectBoxSchema = StructureSchema.objOf(selectBoxFields);

export const selectBoxDataProcessor = ValueType.string;

export const createSelectBox = (spec: SelectBoxSpec): Result<SelectBox, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<SelectBox>('selectbox', selectBoxSchema, spec);
