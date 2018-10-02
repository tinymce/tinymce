import { Option } from '@ephox/katamari';
import { FieldSchema } from '@ephox/boulder';

export interface FormComponentApi {
  type: string;
  name: string;
  label?: string;
  colspan?: number;
}

export interface FormComponent {
  type: string;
  name: string;
  label: Option<string>;
  colspan: Option<number>;
}

export const formComponentFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('name'),
  FieldSchema.optionString('label')
];
