import { FieldSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

export interface FormComponentSpec {
  type: string;
  name: string;
}

export interface FormComponent {
  type: string;
  name: string;
}

export interface FormComponentWithLabelSpec extends FormComponentSpec {
  label?: string;
}

export interface FormComponentWithLabel extends FormComponent {
  label: Optional<string>;
}

export const formComponentFields = [
  FieldSchema.requiredString('type'),
  FieldSchema.requiredString('name')
];

export const formComponentWithLabelFields = formComponentFields.concat([
  FieldSchema.optionString('label')
]);
