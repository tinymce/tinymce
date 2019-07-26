import { ValueSchema, FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabelApi, FormComponentWithLabel, formComponentWithLabelFields } from './FormComponent';

export interface ExternalSelectBoxItem {
  text: string;
  value: string;
}

export interface SelectBoxApi extends FormComponentWithLabelApi {
  type: 'selectbox';
  items: ExternalSelectBoxItem[];
  size?: number;
  disabled?: boolean;
}

interface InternalSelectBoxItem extends ExternalSelectBoxItem {
  text: string;
  value: string;
}

export interface SelectBox extends FormComponentWithLabel {
  type: 'selectbox';
  items: InternalSelectBoxItem[];
  size: number;
  disabled: boolean;
}

const selectBoxFields: FieldProcessorAdt[] = formComponentWithLabelFields.concat([
  FieldSchema.strictArrayOfObj('items', [
    FieldSchema.strictString('text'),
    FieldSchema.strictString('value')
  ]),
  FieldSchema.defaultedNumber('size', 1),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const selectBoxSchema = ValueSchema.objOf(selectBoxFields);

export const selectBoxDataProcessor = ValueSchema.string;

export const createSelectBox = (spec: SelectBoxApi): Result<SelectBox, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<SelectBox>('selectbox', selectBoxSchema, spec);
};
