import { Option } from '@ephox/katamari';
import { FieldSchema } from '@ephox/boulder';

export interface FormComponentApi {
  type: string;
  name: string;
}

export interface FormComponent {
  type: string;
  name: string;
}

export interface FormComponentWithLabelApi extends FormComponentApi {
  label?: string;
}

export interface FormComponentWithLabel extends FormComponent {
  label: Option<string>;
}

export const formComponentFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('name')
];

export const formComponentWithLabelFields = formComponentFields.concat([
  FieldSchema.optionString('label')
]);
