import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Option, Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface TextAreaApi extends FormComponentWithLabelApi {
  type: 'textarea';
  placeholder?: string;
  maximized?: boolean;
  disabled?: boolean;
}

export interface TextArea extends FormComponentWithLabel {
  type: 'textarea';
  maximized: boolean;
  placeholder: Option<string>;
  disabled: boolean;
}

const textAreaFields = formComponentWithLabelFields.concat([
  FieldSchema.optionString('placeholder'),
  FieldSchema.defaultedBoolean('maximized', false),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const textAreaSchema = ValueSchema.objOf(textAreaFields);

export const textAreaDataProcessor = ValueSchema.string;

export const createTextArea = (spec: TextAreaApi): Result<TextArea, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<TextArea>('textarea', textAreaSchema, spec);
