import { FieldSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

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
  label: Optional<string>;
}

export const formComponentFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('name')
];

export const formComponentWithLabelFields = formComponentFields.concat([
  FieldSchema.optionString('label')
]);
