import { Option } from '@ephox/katamari';
import { FieldSchema } from '@ephox/boulder';

export interface FormComponentApi {
  type: string;
  name: string;
  label?: string;
}

export interface FormComponent {
  type: string;
  name: string;
  label: Option<string>;
}

export const formComponentFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('name'),
  FieldSchema.optionString('label')
];
