import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Option, Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface TextAreaApi extends FormComponentWithLabelApi {
  type: 'textarea';
  placeholder?: string;
}

export interface TextArea extends FormComponentWithLabel {
  type: 'textarea';
  placeholder?: Option<string>;
}

export const textAreaFields = formComponentWithLabelFields.concat([
  FieldSchema.optionString('placeholder')
]);

export const textAreaSchema = ValueSchema.objOf(textAreaFields);

export const textAreaDataProcessor = ValueSchema.string;

export const createTextArea = (spec: TextAreaApi): Result<TextArea, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<TextArea>('textarea', textAreaSchema, spec);
};
