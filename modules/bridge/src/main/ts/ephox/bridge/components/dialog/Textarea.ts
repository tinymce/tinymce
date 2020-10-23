import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface TextAreaSpec extends FormComponentWithLabelSpec {
  type: 'textarea';
  placeholder?: string;
  maximized?: boolean;
  disabled?: boolean;
}

export interface TextArea extends FormComponentWithLabel {
  type: 'textarea';
  maximized: boolean;
  placeholder: Optional<string>;
  disabled: boolean;
}

const textAreaFields = formComponentWithLabelFields.concat([
  FieldSchema.optionString('placeholder'),
  FieldSchema.defaultedBoolean('maximized', false),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const textAreaSchema = ValueSchema.objOf(textAreaFields);

export const textAreaDataProcessor = ValueSchema.string;

export const createTextArea = (spec: TextAreaSpec): Result<TextArea, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<TextArea>('textarea', textAreaSchema, spec);
